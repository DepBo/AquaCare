import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../widgets/floating_role_nav.dart';
import 'login_screen.dart';

class StaffScreen extends StatefulWidget {
  const StaffScreen({super.key});

  @override
  State<StaffScreen> createState() => _StaffScreenState();
}

class _StaffScreenState extends State<StaffScreen> {
  bool _isDark = true;
  bool _isLoading = true;
  int _activeTab = 0;

  // User Profile
  String _staffName = 'Nhân viên';
  String _staffRole = 'staff_warehouse';
  String _staffInitials = 'S';
  String? _currentUserId;

  // Data Lists
  List<Map<String, dynamic>> _packingTasks = [];
  Map<String, dynamic>? _selectedPackingTask;

  List<Map<String, dynamic>> _allTasks = [];
  List<Map<String, dynamic>> _supportRequests = [];

  // Form State for Packing Station
  final Map<String, TextEditingController> _macControllers = {};
  final Map<String, String> _macErrors = {};
  bool _isSubmittingPacking = false;

  // Task Board Sub-tab filter
  String _boardFilterStatus = 'todo'; // 'todo', 'in_progress'

  // Role Mappings - Identical to Web (StaffPage.tsx)
  static const Map<String, List<String>> _roleTaskTypesMap = {
    'staff_warehouse': ['packing'],
    'staff_shipper': ['delivery_install', 'Giao hàng & lắp đặt'],
    'staff_support': ['support'],
    'staff_maintenance': ['maintenance', 'Bảo trì thiết bị'],
    'staff': [
      'packing',
      'delivery_install',
      'maintenance',
      'support',
      'Giao hàng & lắp đặt',
      'Bảo trì thiết bị',
    ],
  };

  static const Map<String, List<String>> _roleTabMap = {
    'staff_warehouse': ['packing', 'history'],
    'staff_shipper': ['board', 'history'],
    'staff_support': ['support', 'history'],
    'staff_maintenance': ['board', 'history'],
    'staff': ['packing', 'board', 'support', 'history'],
  };

  List<String> get _allowedTaskTypes {
    if (_staffRole == 'admin') {
      return _roleTaskTypesMap['staff']!;
    }
    return _roleTaskTypesMap[_staffRole] ?? _roleTaskTypesMap['staff']!;
  }

  List<String> get _allowedTabs {
    if (_staffRole == 'admin') {
      return _roleTabMap['staff']!;
    }
    return _roleTabMap[_staffRole] ?? _roleTabMap['staff']!;
  }

  String get _currentTabKey {
    final tabs = _allowedTabs;
    if (_activeTab >= tabs.length) {
      return tabs[0];
    }
    return tabs[_activeTab];
  }

  List<Map<String, dynamic>> get _roleFilteredTasks {
    final types = _allowedTaskTypes;
    return _allTasks.where((t) {
      final taskType = t['task_type']?.toString() ?? '';
      final displayType = t['type']?.toString() ?? '';
      final isTypeAllowed =
          types.contains(taskType) || types.contains(displayType);
      if (!isTypeAllowed) return false;

      if (_staffRole == 'admin' || _staffRole == 'staff') return true;
      final assigned = t['assigned_to']?.toString();
      return assigned == null || assigned == _currentUserId;
    }).toList();
  }

  @override
  void initState() {
    super.initState();
    _loadTheme();
    _loadProfile();
    _fetchData();
  }

  @override
  void dispose() {
    _macControllers.forEach((_, controller) => controller.dispose());
    super.dispose();
  }

  Future<void> _loadTheme() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _isDark = prefs.getBool('staff_is_dark') ?? true;
    });
  }

  Future<void> _toggleTheme() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _isDark = !_isDark;
    });
    await prefs.setBool('staff_is_dark', _isDark);
  }

  Future<void> _loadProfile() async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user != null) {
        _currentUserId = user.id;
        final res = await Supabase.instance.client
            .from('users')
            .select('full_name, role, phone')
            .eq('id', user.id)
            .maybeSingle();

        if (res != null) {
          final fullName = (res['full_name'] as String?)?.trim() ?? 'Staff';
          final role = (res['role'] as String?) ?? 'staff_warehouse';
          setState(() {
            _staffName = fullName;
            _staffRole = role;
            _staffInitials = _getInitials(fullName);
          });
          return;
        }
      }

      final prefs = await SharedPreferences.getInstance();
      final savedInfo = prefs.getString('user_info');
      if (savedInfo != null) {
        final map = Map<String, dynamic>.from(Uri.splitQueryString(savedInfo));
        final fullName = map['full_name'] ?? 'Staff';
        final role = map['role'] ?? 'staff_warehouse';
        setState(() {
          _staffName = fullName;
          _staffRole = role;
          _staffInitials = _getInitials(fullName);
        });
      }
    } catch (e) {
      debugPrint('⚠️ Error loading staff profile: $e');
    }
  }

  String _getInitials(String name) {
    if (name.trim().isEmpty) return 'S';
    final words = name.trim().split(RegExp(r'\s+'));
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return words[0][0].toUpperCase();
  }

  String _getRoleLabel(String role) {
    switch (role) {
      case 'staff_warehouse':
        return 'Nhân viên Kho';
      case 'staff_shipper':
        return 'Nhân viên Giao hàng';
      case 'staff_support':
        return 'Nhân viên Hỗ trợ';
      case 'staff_maintenance':
        return 'Nhân viên Bảo trì';
      case 'admin':
        return 'Quản trị viên (Staff View)';
      default:
        return 'Staff AquaCare';
    }
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      await Future.wait([_fetchTasks(), _fetchSupportRequests()]);
    } catch (e) {
      debugPrint('❌ Lỗi khi tải dữ liệu staff: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchTasks() async {
    try {
      final res = await Supabase.instance.client
          .from('tasks')
          .select('*, orders(*, order_items(*))')
          .order('created_at', ascending: false);

      final List<Map<String, dynamic>> list = List<Map<String, dynamic>>.from(
        res,
      );
      setState(() {
        _allTasks = list;
      });

      // Filter Packing Tasks specifically for Warehouse Station
      final packing = list.where((t) {
        final isPacking = t['task_type'] == 'packing' && t['status'] == 'todo';
        if (!isPacking) return false;
        if (_staffRole == 'admin' || _staffRole == 'staff') return true;
        final assigned = t['assigned_to']?.toString();
        return assigned == null || assigned == _currentUserId;
      }).toList();

      setState(() {
        _packingTasks = packing;
        if (packing.isNotEmpty) {
          if (_selectedPackingTask == null ||
              !packing.any(
                (t) =>
                    t['id'].toString() ==
                    _selectedPackingTask!['id'].toString(),
              )) {
            _selectedPackingTask = packing[0];
            _initMacControllersForSelectedTask();
          }
        } else {
          _selectedPackingTask = null;
        }
      });
    } catch (e) {
      debugPrint('❌ Lỗi fetch tasks: $e');
    }
  }

  Future<void> _fetchSupportRequests() async {
    try {
      final res = await Supabase.instance.client
          .from('support_requests')
          .select('*')
          .order('created_at', ascending: false);

      setState(() {
        _supportRequests = List<Map<String, dynamic>>.from(res);
      });
    } catch (e) {
      debugPrint('⚠️ Lỗi fetch support requests: $e');
    }
  }

  void _initMacControllersForSelectedTask() {
    _macControllers.forEach((_, c) => c.dispose());
    _macControllers.clear();
    _macErrors.clear();

    if (_selectedPackingTask == null) return;
    final order = _selectedPackingTask!['orders'];
    if (order == null || order['order_items'] == null) return;

    final items = order['order_items'] as List;
    for (final item in items) {
      final itemId = item['id'].toString();
      final qty = (item['quantity'] as num?)?.toInt() ?? 1;
      for (int i = 0; i < qty; i++) {
        final key = '${itemId}_$i';
        _macControllers[key] = TextEditingController();
      }
    }
  }

  String _normalizeVer(dynamic ver) {
    if (ver == null) return 'V1';
    final str = ver.toString().trim().toUpperCase();
    if (str.isEmpty) return 'V1';
    final match = RegExp(r'V(\d+)', caseSensitive: false).firstMatch(str);
    if (match != null) return 'V${match.group(1)}';
    if (RegExp(r'^\d+$').hasMatch(str)) return 'V$str';
    if (str.contains('PREMIUM')) return 'V4';
    if (str.contains('ADVANCED')) return 'V3';
    if (str.contains('BASIC')) return 'V2';
    if (str.contains('STARTER')) return 'V1';
    return str.startsWith('V') ? str : 'V$str';
  }

  String _resolveItemVersion(dynamic rawItem) {
    if (rawItem is! Map) return 'V1';
    final item = Map<String, dynamic>.from(rawItem);

    // 1. Check explicit version attributes
    final explicit =
        item['version'] ??
        item['product_version'] ??
        item['firmware_version'] ??
        item['variant'];
    if (explicit != null && explicit.toString().trim().isNotEmpty) {
      return _normalizeVer(explicit);
    }

    // 2. Check product_id (e.g. 'v4', 'v1', or numeric)
    final pid = item['product_id']?.toString().trim();
    if (pid != null && pid.isNotEmpty) {
      final pidMatch = RegExp(r'v?(\d+)', caseSensitive: false).firstMatch(pid);
      if (pidMatch != null) {
        return 'V${pidMatch.group(1)}';
      }
    }

    // 3. Check product_name keywords
    final name = (item['product_name'] ?? item['name'] ?? '')
        .toString()
        .toUpperCase();
    final nameMatch = RegExp(r'V(\d+)', caseSensitive: false).firstMatch(name);
    if (nameMatch != null) return 'V${nameMatch.group(1)}';
    if (name.contains('PREMIUM')) return 'V4';
    if (name.contains('ADVANCED')) return 'V3';
    if (name.contains('BASIC')) return 'V2';
    if (name.contains('STARTER')) return 'V1';

    // 4. Nested products object if joined
    if (item['products'] is Map && item['products']['version'] != null) {
      return _normalizeVer(item['products']['version']);
    }

    return 'V1';
  }

  Future<void> _submitPacking() async {
    if (_selectedPackingTask == null) return;
    final order = _selectedPackingTask!['orders'];
    if (order == null) return;

    setState(() {
      _macErrors.clear();
      _isSubmittingPacking = true;
    });

    final items = (order['order_items'] as List?) ?? [];
    final List<Map<String, dynamic>> requiredList = [];

    for (final item in items) {
      final itemId = item['id'].toString();
      final qty = (item['quantity'] as num?)?.toInt() ?? 1;
      final verStr = _resolveItemVersion(item);
      for (int i = 0; i < qty; i++) {
        requiredList.add({
          'itemId': itemId,
          'item': item,
          'name': item['product_name'] ?? 'Sản phẩm',
          'version': verStr,
          'index': i,
        });
      }
    }

    final Map<String, String> errors = {};

    // 1. Validate empty inputs
    for (final req in requiredList) {
      final key = '${req['itemId']}_${req['index']}';
      final val = _macControllers[key]?.text.trim() ?? '';
      if (val.isEmpty) {
        errors[key] = 'Vui lòng nhập mã MAC cho thiết bị';
      }
    }

    if (errors.isNotEmpty) {
      setState(() {
        _macErrors.addAll(errors);
        _isSubmittingPacking = false;
      });
      return;
    }

    // 2. Validate duplicate MAC entries in form
    final Map<String, List<String>> macCounts = {};
    for (final req in requiredList) {
      final key = '${req['itemId']}_${req['index']}';
      final val = _macControllers[key]!.text.trim().toUpperCase();
      macCounts.putIfAbsent(val, () => []).add(key);
    }

    macCounts.forEach((macVal, keys) {
      if (keys.length > 1) {
        for (final k in keys) {
          errors[k] = 'Mã MAC $macVal bị nhập trùng lặp';
        }
      }
    });

    if (errors.isNotEmpty) {
      setState(() {
        _macErrors.addAll(errors);
        _isSubmittingPacking = false;
      });
      return;
    }

    // 3. Query DB to validate device existence, availability & version match
    final enteredMacs = requiredList
        .map(
          (req) =>
              _macControllers['${req['itemId']}_${req['index']}']!.text.trim(),
        )
        .toList();
    final searchList = enteredMacs
        .expand((m) => [m, m.toUpperCase(), m.toLowerCase()])
        .toSet()
        .toList();

    try {
      final dbDevicesRes = await Supabase.instance.client
          .from('devices')
          .select('mac_address, firmware_version, is_active, tank_id')
          .filter('mac_address', 'in', searchList);

      final Map<String, Map<String, dynamic>> deviceMap = {};
      if (dbDevicesRes.isNotEmpty) {
        for (final dev in (dbDevicesRes as List)) {
          final mac = dev['mac_address']?.toString().trim().toUpperCase();
          if (mac != null) deviceMap[mac] = Map<String, dynamic>.from(dev);
        }
      }

      for (final req in requiredList) {
        final key = '${req['itemId']}_${req['index']}';
        final macVal = _macControllers[key]!.text.trim().toUpperCase();
        final reqVer = req['version'];

        final dbDev = deviceMap[macVal];
        if (dbDev == null) {
          errors[key] = 'Mã MAC "$macVal" không tồn tại trong hệ thống kho';
        } else if (dbDev['is_active'] == true || dbDev['tank_id'] != null) {
          errors[key] =
              'Mã MAC "$macVal" đã được xuất kho / bán cho đơn hàng khác';
        } else {
          final devVer = _normalizeVer(dbDev['firmware_version']);
          if (devVer != reqVer) {
            errors[key] =
                'Mã MAC này thuộc phiên bản $devVer, không khớp với sản phẩm ($reqVer)';
          }
        }
      }

      if (errors.isNotEmpty) {
        setState(() {
          _macErrors.addAll(errors);
          _isSubmittingPacking = false;
        });
        return;
      }

      // Save scanned MACs to order_items & mark devices active
      for (final item in items) {
        final itemId = item['id'].toString();
        final macsForThisItem = requiredList
            .where((req) => req['itemId'] == itemId)
            .map(
              (req) => _macControllers['${req['itemId']}_${req['index']}']!.text
                  .trim(),
            )
            .toList();

        await Supabase.instance.client
            .from('order_items')
            .update({'device_macs': macsForThisItem})
            .eq('id', itemId);

        if (macsForThisItem.isNotEmpty) {
          final macsToUpdate = macsForThisItem
              .expand((m) => [m, m.toUpperCase(), m.toLowerCase()])
              .toList();
          await Supabase.instance.client
              .from('devices')
              .update({'is_active': true})
              .filter('mac_address', 'in', macsToUpdate);
        }
      }

      // Mark current packing task done
      final taskId = _selectedPackingTask!['id'];
      await Supabase.instance.client
          .from('tasks')
          .update({
            'status': 'done',
            'assigned_to': _currentUserId,
            'completed_at': DateTime.now().toIso8601String(),
          })
          .eq('id', taskId);

      // Create delivery task for shipper (DB trigger assign_task_automatically auto-assigns to staff_shipper with least tasks!)
      await Supabase.instance.client.from('tasks').insert({
        'task_type': 'delivery_install',
        'order_id': order['id'],
        'customer_id': order['user_id'],
        'title': 'Giao hàng & Lắp đặt Đơn #${order['id']}',
        'description':
            'Khách hàng: ${order['shipping_name']}\nSĐT: ${order['shipping_phone']}\nĐịa chỉ: ${order['shipping_address']}',
      });

      _showSnackBar(
        'Đã đóng gói xong Đơn #${order['id']}. Đã tự động phân đơn giao hàng!',
      );
      await _fetchTasks();
    } catch (e) {
      debugPrint('❌ Error submitting packing: $e');
      _showSnackBar('Có lỗi xảy ra: $e', isError: true);
    } finally {
      if (mounted) setState(() => _isSubmittingPacking = false);
    }
  }

  Future<void> _advanceTaskStatus(Map<String, dynamic> task) async {
    final currentStatus = task['status'];
    final nextStatus = currentStatus == 'todo' ? 'in_progress' : 'done';
    final taskId = task['id'];

    try {
      await Supabase.instance.client
          .from('tasks')
          .update({
            'status': nextStatus,
            'assigned_to':
                _currentUserId, // Lock task to current staff member so load balancing updates correctly
            if (nextStatus == 'done')
              'completed_at': DateTime.now().toIso8601String(),
          })
          .eq('id', taskId);

      // If delivery_install completed, update order status to delivered
      if (nextStatus == 'done' &&
          task['task_type'] == 'delivery_install' &&
          task['order_id'] != null) {
        await Supabase.instance.client
            .from('orders')
            .update({'status': 'delivered'})
            .eq('id', task['order_id']);
      }

      _showSnackBar(
        nextStatus == 'done'
            ? 'Đã hoàn thành nhiệm vụ!'
            : 'Đã nhận việc thành công!',
      );
      await _fetchTasks();
    } catch (e) {
      _showSnackBar('Lỗi khi cập nhật trạng thái: $e', isError: true);
    }
  }

  void _openReplyDialog(String requestId) {
    final controller = TextEditingController();
    final modalBg = _isDark ? const Color(0xFF1F1F1F) : Colors.white;
    final textPrimary = _isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = _isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);
    final primary = const Color(0xFF0284C7);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: modalBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Phản hồi yêu cầu hỗ trợ',
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w700,
            color: textPrimary,
            fontSize: 16,
          ),
        ),
        content: TextField(
          controller: controller,
          maxLines: 4,
          style: GoogleFonts.inter(fontSize: 13.5, color: textPrimary),
          decoration: InputDecoration(
            hintText: 'Nhập câu trả lời cho khách hàng...',
            hintStyle: GoogleFonts.inter(fontSize: 13, color: textSecondary),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Hủy', style: GoogleFonts.inter(color: textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: primary,
              elevation: 0,
            ),
            onPressed: () async {
              final text = controller.text.trim();
              Navigator.pop(ctx);
              await _handleReplySupport(requestId, text);
            },
            child: Text(
              'Gửi',
              style: GoogleFonts.inter(
                color: Colors.white,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleReplySupport(String requestId, String replyText) async {
    if (replyText.trim().isEmpty) {
      _showSnackBar('Vui lòng nhập nội dung phản hồi', isError: true);
      return;
    }
    try {
      await Supabase.instance.client
          .from('support_requests')
          .update({'status': 'replied', 'staff_reply': replyText.trim()})
          .eq('id', requestId);

      _showSnackBar('Đã gửi phản hồi cho khách hàng!');
      await _fetchSupportRequests();
    } catch (e) {
      _showSnackBar('Lỗi khi gửi phản hồi: $e', isError: true);
    }
  }

  Future<void> _createMaintenanceFromSupport(Map<String, dynamic> req) async {
    try {
      final customerName = req['full_name'] ?? 'Khách hàng';
      final phone = req['phone'] ?? 'N/A';
      final email = req['email'] ?? 'N/A';
      final content = req['message'] ?? '';
      final staffReply = (req['staff_reply'] ?? '').toString().trim();

      String address = (req['address'] ?? '').toString().trim();
      if (address.isEmpty) {
        try {
          final orderData = await Supabase.instance.client
              .from('orders')
              .select('shipping_address')
              .or('shipping_phone.eq.$phone,shipping_email.eq.$email')
              .order('created_at', ascending: false)
              .limit(1);

          if (orderData.isNotEmpty &&
              orderData[0]['shipping_address'] != null) {
            address = orderData[0]['shipping_address'].toString().trim();
          }
        } catch (err) {
          debugPrint('Address lookup notice: $err');
        }
      }
      if (address.isEmpty) {
        address = 'Chưa cung cấp địa chỉ';
      }

      final replyContent = staffReply.isNotEmpty
          ? staffReply
          : 'Cần kiểm tra & bảo trì thiết bị trực tiếp tại nhà';

      final description =
          'Khách hàng: $customerName\nSĐT: $phone\nEmail: $email\nĐịa chỉ: $address\n-------------------\nNỘI DUNG YÊU CẦU:\n$content\n-------------------\nPHẢN HỒI CSKH:\n$replyContent';

      // Insert new maintenance task - DB trigger automatically assigns to staff_maintenance with least active tasks!
      await Supabase.instance.client.from('tasks').insert({
        'task_type': 'maintenance',
        'title': 'Bảo trì thiết bị tại nhà: $customerName',
        'description': description,
        'status': 'todo',
      });

      _showSnackBar(
        'Đã chuyển yêu cầu thành task Bảo trì. Đã tự động chia đơn cho Nhân viên Bảo trì có ít đơn nhất!',
      );
      await _fetchTasks();
    } catch (e) {
      _showSnackBar('Lỗi tạo nhiệm vụ bảo trì: $e', isError: true);
    }
  }

  void _showSnackBar(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isError ? Icons.error_outline : Icons.check_circle_outline,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                message,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: isError
            ? const Color(0xFFEF4444)
            : const Color(0xFF0284C7),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _handleLogout() {
    final modalBg = _isDark ? const Color(0xFF222225) : Colors.white;
    final textPrimary = _isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = _isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: modalBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Đăng xuất',
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w700,
            color: textPrimary,
          ),
        ),
        content: Text(
          'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống Staff?',
          style: GoogleFonts.inter(color: textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Hủy', style: GoogleFonts.inter(color: textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              elevation: 0,
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              await Supabase.instance.client.auth.signOut();
              final prefs = await SharedPreferences.getInstance();
              await prefs.clear();
              if (mounted) {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
            child: Text(
              'Đăng xuất',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bgColor = _isDark ? const Color(0xFF141414) : const Color(0xFFF8FAFC);
    final topbarBg = _isDark ? const Color(0xFF1F1F1F) : Colors.white;
    final cardBorder = _isDark
        ? const Color(0xFF333333)
        : const Color(0xFFCBD5E1);
    final textPrimary = _isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final primary = const Color(0xFF0284C7);

    final allowedTabs = _allowedTabs;
    final filteredTasks = _roleFilteredTasks;

    // Compute badges
    final pendingPackingCount = _packingTasks.length;
    final pendingTasksCount = filteredTasks
        .where((t) => t['status'] == 'todo' || t['status'] == 'in_progress')
        .length;
    // Support requests badge ONLY counts unanswered requests (status != 'replied')
    final pendingSupportCount = _supportRequests
        .where((r) => r['status'] != 'replied')
        .length;
    // History badge includes completed tasks + answered support requests
    final answeredSupportCount = _supportRequests
        .where((r) => r['status'] == 'replied')
        .length;
    final historyCount =
        filteredTasks.where((t) => t['status'] == 'done').length +
        (_staffRole == 'staff_support' ||
                _staffRole == 'admin' ||
                _staffRole == 'staff'
            ? answeredSupportCount
            : 0);

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        bottom: false,
        child: Stack(
          children: [
            Column(
              children: [
                // ── Top Header ──
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 14,
                  ),
                  decoration: BoxDecoration(
                    color: topbarBg,
                    border: Border(bottom: BorderSide(color: cardBorder)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          color: primary,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Center(
                          child: Text(
                            _staffInitials,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _staffName,
                              style: GoogleFonts.inter(
                                fontSize: 15.5,
                                fontWeight: FontWeight.w700,
                                color: textPrimary,
                              ),
                            ),
                            Text(
                              _getRoleLabel(_staffRole),
                              style: GoogleFonts.inter(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w600,
                                color: primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: _toggleTheme,
                        icon: Icon(
                          _isDark
                              ? Icons.light_mode_outlined
                              : Icons.dark_mode_outlined,
                          color: textPrimary,
                          size: 20,
                        ),
                        tooltip: 'Đổi giao diện',
                      ),
                      IconButton(
                        onPressed: _handleLogout,
                        icon: const Icon(
                          Icons.logout_rounded,
                          color: Color(0xFFEF4444),
                          size: 20,
                        ),
                        tooltip: 'Đăng xuất',
                      ),
                    ],
                  ),
                ),

                // ── Main Content Area ──
                Expanded(
                  child: _isLoading
                      ? Center(child: CircularProgressIndicator(color: primary))
                      : _buildActiveTabContent(),
                ),
              ],
            ),
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: FloatingRoleNav(
                isDark: _isDark,
                selectedIndex: _activeTab >= allowedTabs.length
                    ? 0
                    : _activeTab,
                items: allowedTabs.map((tabKey) {
                  final index = allowedTabs.indexOf(tabKey);
                  return FloatingRoleNavItem(
                    label: switch (tabKey) {
                      'packing' => 'Đóng gói',
                      'board' => 'Công việc',
                      'support' => 'Hỗ trợ',
                      _ => 'Lịch sử',
                    },
                    symbol: switch (tabKey) {
                      'packing' => 'packing',
                      'board' => 'board',
                      'support' => 'support',
                      _ => 'history',
                    },
                    badgeCount: switch (tabKey) {
                      'packing' => pendingPackingCount,
                      'board' => pendingTasksCount,
                      'support' => pendingSupportCount,
                      _ => historyCount,
                    },
                    onTap: () => setState(() => _activeTab = index),
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActiveTabContent() {
    switch (_currentTabKey) {
      case 'packing':
        return _buildPackingStationTab();
      case 'board':
        return _buildTaskBoardTab();
      case 'support':
        return _buildSupportRequestsTab();
      case 'history':
        return _buildHistoryTab();
      default:
        return _buildHistoryTab();
    }
  }

  // ════════════════════════════════════════════════════════════
  // 1. TRẠM ĐÓNG GÓI (PACKING STATION FOR WAREHOUSE STAFF)
  // ════════════════════════════════════════════════════════════
  Widget _buildPackingStationTab() {
    final cardBg = _isDark ? const Color(0xFF1F1F1F) : Colors.white;
    final cardBorder = _isDark
        ? const Color(0xFF333333)
        : const Color(0xFFCBD5E1);
    final textPrimary = _isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = _isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);
    final primary = const Color(0xFF0284C7);

    if (_packingTasks.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.check_circle_outline_rounded,
              size: 64,
              color: primary.withValues(alpha: 0.4),
            ),
            const SizedBox(height: 16),
            Text(
              'Không có đơn hàng cần đóng gói!',
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Tất cả đơn hàng của kho đã được hoàn thành.',
              style: GoogleFonts.inter(fontSize: 13, color: textSecondary),
            ),
          ],
        ),
      );
    }

    final activeOrder = _selectedPackingTask?['orders'];

    return RefreshIndicator(
      onRefresh: _fetchData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.fromLTRB(
          16, 16, 16, 96 + MediaQuery.paddingOf(context).bottom,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order Selector Dropdown / Scroll Chips
            Text(
              'CHỌN ĐƠN HÀNG CẦN XUẤT KHO:',
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: primary,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 48,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _packingTasks.length,
                itemBuilder: (ctx, idx) {
                  final task = _packingTasks[idx];
                  final orderId =
                      task['order_id'] ?? task['orders']?['id'] ?? idx;
                  final isSelected = _selectedPackingTask?['id'] == task['id'];

                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedPackingTask = task;
                        _initMacControllersForSelectedTask();
                      });
                    },
                    child: Container(
                      margin: const EdgeInsets.only(right: 10),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? primary.withValues(alpha: 0.15)
                            : cardBg,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected ? primary : cardBorder,
                          width: isSelected ? 1.5 : 1,
                        ),
                      ),
                      child: Center(
                        child: Row(
                          children: [
                            Icon(
                              Icons.inventory_2_outlined,
                              size: 16,
                              color: isSelected ? primary : textSecondary,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              'Đơn #$orderId',
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                fontWeight: isSelected
                                    ? FontWeight.w700
                                    : FontWeight.w500,
                                color: isSelected ? primary : textPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),

            if (activeOrder != null) ...[
              // Customer Info Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: cardBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'ĐƠN HÀNG #${activeOrder['id']}',
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: primary,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: primary.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'Chờ đóng gói',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 20),
                    _buildInfoLine(
                      Icons.person_outline,
                      'Khách hàng:',
                      activeOrder['shipping_name'] ?? 'N/A',
                      textPrimary,
                      textSecondary,
                    ),
                    const SizedBox(height: 6),
                    _buildInfoLine(
                      Icons.phone_outlined,
                      'SĐT:',
                      activeOrder['shipping_phone'] ?? 'N/A',
                      textPrimary,
                      textSecondary,
                    ),
                    const SizedBox(height: 6),
                    _buildInfoLine(
                      Icons.location_on_outlined,
                      'Địa chỉ:',
                      activeOrder['shipping_address'] ?? 'N/A',
                      textPrimary,
                      textSecondary,
                    ),
                    if (activeOrder['note'] != null &&
                        activeOrder['note'].toString().trim().isNotEmpty) ...[
                      const SizedBox(height: 6),
                      _buildInfoLine(
                        Icons.note_alt_outlined,
                        'Ghi chú:',
                        activeOrder['note'].toString(),
                        const Color(0xFFD97706),
                        textSecondary,
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Scanner / MAC Inputs Section
              Text(
                'QUÉT MÃ MAC THIẾT BỊ SẢN PHẨM:',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: primary,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 8),

              ..._buildMacInputFields(activeOrder),

              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: _isSubmittingPacking ? null : _submitPacking,
                  icon: _isSubmittingPacking
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(
                          Icons.check_circle_outline,
                          color: Colors.white,
                        ),
                  label: Text(
                    _isSubmittingPacking
                        ? 'Đang xử lý...'
                        : 'Xác nhận Đóng gói & Chuyển Giao hàng',
                    style: GoogleFonts.inter(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    elevation: 0,
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ],
        ),
      ),
    );
  }

  List<Widget> _buildMacInputFields(Map<String, dynamic> activeOrder) {
    final cardBg = _isDark ? const Color(0xFF1F1F1F) : Colors.white;
    final cardBorder = _isDark
        ? const Color(0xFF333333)
        : const Color(0xFFCBD5E1);
    final textPrimary = _isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = _isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);
    final primary = const Color(0xFF0284C7);
    final inputBg = _isDark ? const Color(0xFF141414) : Colors.white;

    final items = (activeOrder['order_items'] as List?) ?? [];
    final List<Widget> widgets = [];

    for (final item in items) {
      final itemId = item['id'].toString();
      final qty = (item['quantity'] as num?)?.toInt() ?? 1;
      final productName = item['product_name'] ?? 'Sản phẩm AquaCare';

      final normVer = _resolveItemVersion(item);

      for (int i = 0; i < qty; i++) {
        final key = '${itemId}_$i';
        final controller = _macControllers[key];
        final errorMsg = _macErrors[key];
        final hasError = errorMsg != null;

        widgets.add(
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: hasError
                  ? const Color(0xFFEF4444).withValues(alpha: 0.06)
                  : cardBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: hasError ? const Color(0xFFEF4444) : cardBorder,
                width: hasError ? 1.5 : 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        '$productName ${qty > 1 ? '(Thứ ${i + 1})' : ''}',
                        style: GoogleFonts.inter(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                          color: textPrimary,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: hasError
                            ? const Color(0xFFEF4444).withValues(alpha: 0.15)
                            : primary.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Phiên bản: $normVer',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: hasError ? const Color(0xFFEF4444) : primary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: controller,
                  style: GoogleFonts.inter(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w600,
                    color: textPrimary,
                  ),
                  decoration: InputDecoration(
                    hintText: 'Nhập hoặc quét mã MAC...',
                    hintStyle: GoogleFonts.inter(
                      fontSize: 13,
                      color: textSecondary.withValues(alpha: 0.6),
                    ),
                    prefixIcon: Icon(
                      Icons.qr_code_scanner,
                      color: hasError ? const Color(0xFFEF4444) : primary,
                      size: 20,
                    ),
                    filled: true,
                    fillColor: inputBg,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 12,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: cardBorder),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: cardBorder),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: hasError ? const Color(0xFFEF4444) : primary,
                        width: 1.5,
                      ),
                    ),
                  ),
                ),
                if (hasError) ...[
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(
                        Icons.error_outline,
                        size: 14,
                        color: Color(0xFFEF4444),
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          errorMsg,
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFFEF4444),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        );
      }
    }

    return widgets;
  }

  Widget _buildInfoLine(
    IconData icon,
    String label,
    String value,
    Color textPrimary,
    Color textSecondary,
  ) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: textSecondary),
        const SizedBox(width: 6),
        Text(
          '$label ',
          style: GoogleFonts.inter(
            fontSize: 12.5,
            fontWeight: FontWeight.w500,
            color: textSecondary,
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 12.5,
              fontWeight: FontWeight.w700,
              color: textPrimary,
            ),
          ),
        ),
      ],
    );
  }

  // ════════════════════════════════════════════════════════════
  // 2. BẢNG CÔNG VIỆC (KANBAN TASK BOARD)
  // ════════════════════════════════════════════════════════════
  Widget _buildTaskBoardTab() {
    final cardBg = _isDark ? const Color(0xFF1F1F1F) : Colors.white;
    final cardBorder = _isDark
        ? const Color(0xFF333333)
        : const Color(0xFFCBD5E1);
    final textPrimary = _isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = _isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);
    final primary = const Color(0xFF0284C7);

    final filtered = _roleFilteredTasks
        .where((t) => t['status'] == _boardFilterStatus)
        .toList();

    return RefreshIndicator(
      onRefresh: _fetchData,
      child: Column(
        children: [
          // Sub Filter Tabs
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: _buildSubFilterButton(
                    label: 'Chờ nhận việc',
                    statusKey: 'todo',
                    count: _roleFilteredTasks
                        .where((t) => t['status'] == 'todo')
                        .length,
                    accentColor: const Color(0xFF64748B),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildSubFilterButton(
                    label: 'Đang thực hiện',
                    statusKey: 'in_progress',
                    count: _roleFilteredTasks
                        .where((t) => t['status'] == 'in_progress')
                        .length,
                    accentColor: primary,
                  ),
                ),
              ],
            ),
          ),

          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.assignment_outlined,
                          size: 56,
                          color: textSecondary.withValues(alpha: 0.4),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Không có công việc nào cho ${_getRoleLabel(_staffRole)}',
                          style: GoogleFonts.inter(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: textPrimary,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: EdgeInsets.fromLTRB(
                      16, 0, 16, 96 + MediaQuery.paddingOf(context).bottom,
                    ),
                    itemCount: filtered.length,
                    itemBuilder: (ctx, idx) {
                      final task = filtered[idx];
                      return _buildTaskCard(
                        task,
                        cardBg,
                        cardBorder,
                        textPrimary,
                        textSecondary,
                        primary,
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubFilterButton({
    required String label,
    required String statusKey,
    required int count,
    required Color accentColor,
  }) {
    final isSelected = _boardFilterStatus == statusKey;
    final cardBg = _isDark ? const Color(0xFF1F1F1F) : Colors.white;
    final cardBorder = _isDark
        ? const Color(0xFF333333)
        : const Color(0xFFCBD5E1);

    return GestureDetector(
      onTap: () => setState(() => _boardFilterStatus = statusKey),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected ? accentColor.withValues(alpha: 0.15) : cardBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? accentColor : cardBorder,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 12.5,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected
                    ? accentColor
                    : (_isDark ? Colors.white70 : Colors.black87),
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: accentColor.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '$count',
                style: GoogleFonts.inter(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w800,
                  color: accentColor,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskCard(
    Map<String, dynamic> task,
    Color cardBg,
    Color cardBorder,
    Color textPrimary,
    Color textSecondary,
    Color primary,
  ) {
    final taskType = task['task_type'] ?? 'packing';
    final status = task['status'] ?? 'todo';
    final title = task['title'] ?? 'Nhiệm vụ #${task['id']}';
    final desc = task['description'] ?? '';

    IconData typeIcon = Icons.inventory_2_outlined;
    String typeLabel = 'Đóng gói hàng';
    if (taskType == 'delivery_install') {
      typeIcon = Icons.local_shipping_outlined;
      typeLabel = 'Giao hàng & lắp đặt';
    } else if (taskType == 'maintenance') {
      typeIcon = Icons.build_outlined;
      typeLabel = 'Bảo trì thiết bị';
    } else if (taskType == 'support') {
      typeIcon = Icons.support_agent_outlined;
      typeLabel = 'Hỗ trợ kỹ thuật';
    }

    final actionLabel = status == 'todo'
        ? 'Nhận việc'
        : status == 'in_progress'
        ? 'Hoàn thành'
        : null;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  children: [
                    Icon(typeIcon, size: 14, color: primary),
                    const SizedBox(width: 4),
                    Text(
                      typeLabel,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: primary,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                '#${task['id']}',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            title,
            style: GoogleFonts.inter(
              fontSize: 14.5,
              fontWeight: FontWeight.w800,
              color: textPrimary,
            ),
          ),
          if (desc.toString().isNotEmpty) ...[
            if (taskType == 'maintenance')
              _buildMaintenanceContent(desc, textPrimary, textSecondary)
            else ...[
              const SizedBox(height: 6),
              Text(
                desc,
                style: GoogleFonts.inter(
                  fontSize: 12.5,
                  color: textSecondary,
                  height: 1.4,
                ),
              ),
            ],
          ],
          const Divider(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(Icons.schedule, size: 14, color: textSecondary),
                  const SizedBox(width: 4),
                  Text(
                    task['created_at'] != null
                        ? task['created_at'].toString().substring(0, 10)
                        : 'Hôm nay',
                    style: GoogleFonts.inter(
                      fontSize: 11.5,
                      color: textSecondary,
                    ),
                  ),
                ],
              ),
              if (actionLabel != null)
                ElevatedButton.icon(
                  onPressed: () => _advanceTaskStatus(task),
                  icon: Icon(
                    status == 'todo' ? Icons.play_arrow_rounded : Icons.check,
                    size: 16,
                    color: Colors.white,
                  ),
                  label: Text(
                    actionLabel,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primary,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    elevation: 0,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Map<String, String> _parseMaintenanceDesc(String rawDesc) {
    if (rawDesc.isEmpty) {
      return {
        'customer': '',
        'phone': '',
        'email': '',
        'address': '',
        'request': '',
        'reply': '',
      };
    }

    String customer = '';
    String phone = '';
    String email = '';
    String address = '';
    String request = '';
    String reply = '';

    // Regex matching handles multiline and inline/single-line text
    final custMatch = RegExp(
      r'Khách hàng:\s*([^\n\r]+?)(?=\s*(?:SĐT|SDT|Email|Địa chỉ|-------------------)|$)',
      caseSensitive: false,
    ).firstMatch(rawDesc);
    if (custMatch != null) customer = custMatch.group(1)?.trim() ?? '';

    final phoneMatch = RegExp(
      r'(?:SĐT|SDT):\s*([^\n\r]+?)(?=\s*(?:Email|Địa chỉ|-------------------)|$)',
      caseSensitive: false,
    ).firstMatch(rawDesc);
    if (phoneMatch != null) phone = phoneMatch.group(1)?.trim() ?? '';

    final emailMatch = RegExp(
      r'Email:\s*([^\n\r]+?)(?=\s*(?:Địa chỉ|-------------------)|$)',
      caseSensitive: false,
    ).firstMatch(rawDesc);
    if (emailMatch != null) email = emailMatch.group(1)?.trim() ?? '';

    final addrMatch = RegExp(
      r'Địa chỉ:\s*([^\n\r]+?)(?=\s*(?:-------------------|NỘI DUNG|YÊU CẦU)|$)',
      caseSensitive: false,
    ).firstMatch(rawDesc);
    if (addrMatch != null) address = addrMatch.group(1)?.trim() ?? '';

    final reqMatch = RegExp(
      r'(?:NỘI DUNG (?:YÊU CẦU|THẮC MẮC\s*/\s*CÂU HỎI|THẮC MẮC)|YÊU CẦU HỖ TRỢ|CÂU HỎI):?\s*([\s\S]*?)(?:-------------------|PHẢN HỒI CSKH:|$)',
      caseSensitive: false,
    ).firstMatch(rawDesc);
    if (reqMatch != null) request = reqMatch.group(1)?.trim() ?? '';

    final replyMatch = RegExp(
      r'PHẢN HỒI CSKH:?\s*([\s\S]*?)(?:-------------------|$)',
      caseSensitive: false,
    ).firstMatch(rawDesc);
    if (replyMatch != null) reply = replyMatch.group(1)?.trim() ?? '';

    // Clean up any remaining trailing/leading dashes or artifacts
    customer = customer.replaceAll(RegExp(r'-{3,}'), '').trim();
    phone = phone.replaceAll(RegExp(r'-{3,}'), '').trim();
    email = email.replaceAll(RegExp(r'-{3,}'), '').trim();
    address = address.replaceAll(RegExp(r'-{3,}'), '').trim();
    request = request.replaceAll(RegExp(r'-{3,}'), '').trim();
    reply = reply.replaceAll(RegExp(r'-{3,}'), '').trim();

    return {
      'customer': customer,
      'phone': phone,
      'email': email,
      'address': address,
      'request': request,
      'reply': reply,
    };
  }

  Widget _buildMaintenanceContent(
    String rawDesc,
    Color textPrimary,
    Color textSecondary,
  ) {
    final parsed = _parseMaintenanceDesc(rawDesc);
    final hasStructuredData =
        parsed['request']!.isNotEmpty || parsed['reply']!.isNotEmpty;

    if (!hasStructuredData) {
      return Padding(
        padding: const EdgeInsets.only(top: 8),
        child: Text(
          rawDesc,
          style: GoogleFonts.inter(
            fontSize: 12.5,
            color: textSecondary,
            height: 1.4,
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 10),
        // Customer quick details
        if (parsed['phone']!.isNotEmpty || parsed['address']!.isNotEmpty) ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
            decoration: BoxDecoration(
              color: _isDark
                  ? const Color(0xFF26262B)
                  : const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (parsed['customer']!.isNotEmpty)
                  _buildMiniInfoRow(
                    Icons.person_outline,
                    'Khách:',
                    parsed['customer']!,
                    textPrimary,
                    textSecondary,
                  ),
                if (parsed['phone']!.isNotEmpty) ...[
                  if (parsed['customer']!.isNotEmpty) const SizedBox(height: 4),
                  _buildMiniInfoRow(
                    Icons.phone_outlined,
                    'SĐT:',
                    parsed['phone']!,
                    textPrimary,
                    textSecondary,
                  ),
                ],
                if (parsed['address']!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  _buildMiniInfoRow(
                    Icons.location_on_outlined,
                    'Địa chỉ:',
                    parsed['address']!,
                    textPrimary,
                    textSecondary,
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 10),
        ],

        // Request content card
        if (parsed['request']!.isNotEmpty) ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF0284C7).withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: const Color(0xFF0284C7).withValues(alpha: 0.25),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.help_outline_rounded,
                      size: 14,
                      color: Color(0xFF0284C7),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'NỘI DUNG YÊU CẦU:',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF0284C7),
                        letterSpacing: 0.4,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                Text(
                  parsed['request']!,
                  style: GoogleFonts.inter(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w500,
                    color: textPrimary,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
        ],

        // CSKH Reply card
        if (parsed['reply']!.isNotEmpty) ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF16A34A).withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: const Color(0xFF16A34A).withValues(alpha: 0.25),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.support_agent_rounded,
                      size: 15,
                      color: Color(0xFF16A34A),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'PHẢN HỒI CSKH:',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF16A34A),
                        letterSpacing: 0.4,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                Text(
                  parsed['reply']!,
                  style: GoogleFonts.inter(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w500,
                    color: textPrimary,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildMiniInfoRow(
    IconData icon,
    String label,
    String value,
    Color textPrimary,
    Color textSecondary,
  ) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 13, color: textSecondary),
        const SizedBox(width: 5),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11.5,
            color: textSecondary,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(width: 5),
        Expanded(
          child: Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 11.5,
              color: textPrimary,
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  // ════════════════════════════════════════════════════════════
  // 3. YÊU CẦU HỖ TRỢ (UNANSWERED SUPPORT REQUESTS)
  // ════════════════════════════════════════════════════════════
  Widget _buildSupportRequestsTab() {
    final cardBg = _isDark ? const Color(0xFF1F1F1F) : Colors.white;
    final cardBorder = _isDark
        ? const Color(0xFF333333)
        : const Color(0xFFCBD5E1);
    final textPrimary = _isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = _isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);
    final primary = const Color(0xFF0284C7);
    // Requirement 3: Only display UNANSWERED support requests (status != 'replied') assigned to this staff or unassigned
    final unansweredRequests = _supportRequests.where((r) {
      if (r['status'] == 'replied') return false;
      if (_staffRole == 'staff_support') {
        final assigned = r['assigned_to']?.toString();
        return assigned == null || assigned == _currentUserId;
      }
      return true;
    }).toList();

    return RefreshIndicator(
      onRefresh: _fetchData,
      child: unansweredRequests.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.mark_chat_read_outlined,
                    size: 56,
                    color: textSecondary.withValues(alpha: 0.4),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Không có yêu cầu cần trả lời',
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: textPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Tất cả yêu cầu hỗ trợ đã được xử lý (Xem ở tab Lịch sử).',
                    style: GoogleFonts.inter(
                      fontSize: 12.5,
                      color: textSecondary,
                    ),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: EdgeInsets.fromLTRB(
                16, 16, 16, 96 + MediaQuery.paddingOf(context).bottom,
              ),
              itemCount: unansweredRequests.length,
              itemBuilder: (ctx, idx) {
                final req = unansweredRequests[idx];

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: cardBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            req['full_name'] ?? 'Khách hàng',
                            style: GoogleFonts.inter(
                              fontSize: 14.5,
                              fontWeight: FontWeight.w800,
                              color: textPrimary,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(
                                0xFFD97706,
                              ).withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.schedule,
                                  size: 12,
                                  color: Color(0xFFD97706),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'Chưa trả lời',
                                  style: GoogleFonts.inter(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: const Color(0xFFD97706),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'SĐT: ${req['phone'] ?? 'N/A'} • Email: ${req['email'] ?? 'N/A'}',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: textSecondary,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: _isDark
                              ? const Color(0xFF141414)
                              : const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          req['message'] ?? '',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: textPrimary,
                            height: 1.4,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          ElevatedButton.icon(
                            onPressed: () =>
                                _openReplyDialog(req['id'].toString()),
                            icon: const Icon(
                              Icons.reply_rounded,
                              size: 14,
                              color: Colors.white,
                            ),
                            label: Text(
                              'Gửi trả lời',
                              style: GoogleFonts.inter(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: primary,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(6),
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 6,
                              ),
                              elevation: 0,
                            ),
                          ),
                          const SizedBox(width: 8),
                          OutlinedButton.icon(
                            onPressed: () => _createMaintenanceFromSupport(req),
                            icon: const Icon(
                              Icons.build_outlined,
                              size: 14,
                              color: Color(0xFFD97706),
                            ),
                            label: Text(
                              'Chuyển Bảo Trì Tại Nhà',
                              style: GoogleFonts.inter(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFFD97706),
                              ),
                            ),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Color(0xFFD97706)),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(6),
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 6,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }

  // ════════════════════════════════════════════════════════════
  // 4. LỊCH SỬ LÀM VIỆC (COMPLETED HISTORY & ANSWERED SUPPORT)
  // ════════════════════════════════════════════════════════════
  Widget _buildHistoryTab() {
    final cardBg = _isDark ? const Color(0xFF1F1F1F) : Colors.white;
    final cardBorder = _isDark
        ? const Color(0xFF333333)
        : const Color(0xFFCBD5E1);
    final textPrimary = _isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = _isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);
    final primary = const Color(0xFF0284C7);

    final completedTasks = _roleFilteredTasks
        .where((t) => t['status'] == 'done')
        .toList();
    final answeredSupport = _supportRequests.where((r) {
      if (r['status'] != 'replied') return false;
      if (_staffRole == 'staff_support') {
        final assigned = r['assigned_to']?.toString();
        return assigned == null || assigned == _currentUserId;
      }
      return true;
    }).toList();

    final bool isSupportRole =
        _staffRole == 'staff_support' ||
        _staffRole == 'admin' ||
        _staffRole == 'staff';

    return RefreshIndicator(
      onRefresh: _fetchData,
      child:
          (completedTasks.isEmpty &&
              (!isSupportRole || answeredSupport.isEmpty))
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.history,
                    size: 56,
                    color: textSecondary.withValues(alpha: 0.4),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Chưa có lịch sử công việc hoàn thành',
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: textPrimary,
                    ),
                  ),
                ],
              ),
            )
          : ListView(
              padding: EdgeInsets.fromLTRB(
                16, 16, 16, 96 + MediaQuery.paddingOf(context).bottom,
              ),
              children: [
                // Completed Tasks Section
                if (completedTasks.isNotEmpty) ...[
                  if (isSupportRole && answeredSupport.isNotEmpty) ...[
                    Text(
                      'NHIỆM VỤ ĐÃ HOÀN THÀNH (${completedTasks.length}):',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: primary,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 8),
                  ],
                  ...completedTasks.map((task) {
                    final title = task['title'] ?? 'Nhiệm vụ #${task['id']}';
                    final completedAt =
                        task['completed_at'] ?? task['created_at'];

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: cardBorder),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              color: const Color(
                                0xFF16A34A,
                              ).withValues(alpha: 0.15),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.check_circle,
                              color: Color(0xFF16A34A),
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  title,
                                  style: GoogleFonts.inter(
                                    fontSize: 13.5,
                                    fontWeight: FontWeight.w700,
                                    color: textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Hoàn thành: ${completedAt != null ? completedAt.toString().substring(0, 10) : 'Vừa xong'}',
                                  style: GoogleFonts.inter(
                                    fontSize: 11.5,
                                    color: textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          OutlinedButton.icon(
                            onPressed: () => _showTaskDetailsModal(task),
                            icon: Icon(
                              Icons.visibility_outlined,
                              color: primary,
                              size: 14,
                            ),
                            label: Text(
                              'Chi tiết',
                              style: GoogleFonts.inter(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w700,
                                color: primary,
                              ),
                            ),
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(color: primary),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 6,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(6),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],

                // Answered Support Requests Section (Requirement 3)
                if (isSupportRole && answeredSupport.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Text(
                    'YÊU CẦU HỖ TRỢ ĐÃ PHẢN HỒI (${answeredSupport.length}):',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF16A34A),
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 8),

                  ...answeredSupport.map((req) {
                    final customerName = req['full_name'] ?? 'Khách hàng';
                    final dateStr = req['created_at'] != null
                        ? req['created_at'].toString().substring(0, 10)
                        : 'Gần đây';

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: cardBorder),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                customerName,
                                style: GoogleFonts.inter(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: textPrimary,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 3,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(
                                    0xFF16A34A,
                                  ).withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  'Đã phản hồi',
                                  style: GoogleFonts.inter(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: const Color(0xFF16A34A),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'SĐT: ${req['phone'] ?? 'N/A'} • $dateStr',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: textSecondary,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: _isDark
                                  ? const Color(0xFF141414)
                                  : const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              req['message'] ?? '',
                              style: GoogleFonts.inter(
                                fontSize: 12.5,
                                color: textPrimary,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (req['staff_reply'] != null) ...[
                            const SizedBox(height: 8),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: primary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(
                                  color: primary.withValues(alpha: 0.2),
                                ),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Icon(
                                    Icons.chat_bubble_outline,
                                    size: 14,
                                    color: primary,
                                  ),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      'Phản hồi: ${req['staff_reply']}',
                                      style: GoogleFonts.inter(
                                        fontSize: 12,
                                        color: textPrimary,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                          const SizedBox(height: 10),
                          Align(
                            alignment: Alignment.centerRight,
                            child: OutlinedButton.icon(
                              onPressed: () =>
                                  _createMaintenanceFromSupport(req),
                              icon: const Icon(
                                Icons.build_outlined,
                                size: 14,
                                color: Color(0xFFD97706),
                              ),
                              label: Text(
                                'Chuyển Bảo Trì Tại Nhà',
                                style: GoogleFonts.inter(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFFD97706),
                                ),
                              ),
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(
                                  color: Color(0xFFD97706),
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 6,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ],
            ),
    );
  }

  // ════════════════════════════════════════════════════════════
  // PREMIUM MODAL: ORDER DETAILS (STAFF WAREHOUSE HISTORY)
  // ════════════════════════════════════════════════════════════
  void _showTaskDetailsModal(Map<String, dynamic> task) {
    final modalBg = _isDark ? const Color(0xFF1B1B1E) : Colors.white;
    final cardBg = _isDark ? const Color(0xFF242428) : const Color(0xFFF8FAFC);
    final textPrimary = _isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = _isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);
    final cardBorder = _isDark
        ? const Color(0xFF333338)
        : const Color(0xFFE2E8F0);
    final primary = const Color(0xFF0284C7);

    final isMaintenance =
        task['task_type'] == 'maintenance' || _staffRole == 'staff_maintenance';
    final order = task['orders'];
    final items = (order?['order_items'] as List?) ?? [];
    final orderId = task['order_id'] ?? order?['id'] ?? task['id'];
    final completedAt = task['completed_at'] ?? task['created_at'];
    final parsedMaintenance = isMaintenance
        ? _parseMaintenanceDesc(task['description'] ?? '')
        : null;

    final headerTitle = isMaintenance
        ? 'Chi tiết nhiệm vụ #${task['id']}'
        : 'Chi tiết xuất kho Đơn #$orderId';
    final headerStatus = isMaintenance
        ? (task['status'] == 'done' ? 'Đã hoàn tất bảo trì' : 'Đang thực hiện')
        : 'Đã đóng gói hoàn tất';
    final headerIcon = isMaintenance
        ? Icons.handyman_rounded
        : Icons.inventory_2_rounded;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(context).size.height * 0.82,
        decoration: BoxDecoration(
          color: modalBg,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: Column(
          children: [
            // Drag Handle Indicator
            Container(
              margin: const EdgeInsets.only(top: 10, bottom: 6),
              width: 40,
              height: 4.5,
              decoration: BoxDecoration(
                color: textSecondary.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(10),
              ),
            ),

            // Modal Header Bar
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 6, 16, 14),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: primary.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(headerIcon, color: primary, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          headerTitle,
                          style: GoogleFonts.inter(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: textPrimary,
                          ),
                        ),
                        Row(
                          children: [
                            const Icon(
                              Icons.check_circle_rounded,
                              size: 13,
                              color: Color(0xFF16A34A),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              headerStatus,
                              style: GoogleFonts.inter(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w600,
                                color: const Color(0xFF16A34A),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(ctx),
                    icon: Icon(
                      Icons.close_rounded,
                      color: textSecondary,
                      size: 22,
                    ),
                  ),
                ],
              ),
            ),
            Divider(height: 1, color: cardBorder),

            // Scrollable Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (isMaintenance) ...[
                      // 1. Customer Info Card
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: cardBg,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: cardBorder),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  Icons.person_pin_circle_rounded,
                                  size: 18,
                                  color: primary,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'THÔNG TIN KHÁCH HÀNG & LIÊN HỆ',
                                  style: GoogleFonts.inter(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w800,
                                    color: primary,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                            const Divider(height: 18),
                            _buildInfoLine(
                              Icons.person_outline_rounded,
                              'Khách hàng:',
                              parsedMaintenance!['customer']!.isNotEmpty
                                  ? parsedMaintenance['customer']!
                                  : (order?['shipping_name'] ??
                                        (task['title']?.toString().replaceFirst(
                                              RegExp(
                                                r'^Bảo trì thiết bị tại nhà:\s*',
                                                caseSensitive: false,
                                              ),
                                              '',
                                            ) ??
                                            'Khách hàng')),
                              textPrimary,
                              textSecondary,
                            ),
                            const SizedBox(height: 8),
                            _buildInfoLine(
                              Icons.phone_outlined,
                              'Số điện thoại:',
                              parsedMaintenance['phone']!.isNotEmpty
                                  ? parsedMaintenance['phone']!
                                  : (order?['shipping_phone'] ?? 'Chưa có SĐT'),
                              textPrimary,
                              textSecondary,
                            ),
                            if (parsedMaintenance['email']!.isNotEmpty) ...[
                              const SizedBox(height: 8),
                              _buildInfoLine(
                                Icons.email_outlined,
                                'Email:',
                                parsedMaintenance['email']!,
                                textPrimary,
                                textSecondary,
                              ),
                            ],
                            const SizedBox(height: 8),
                            _buildInfoLine(
                              Icons.location_on_outlined,
                              'Địa chỉ:',
                              parsedMaintenance['address']!.isNotEmpty
                                  ? parsedMaintenance['address']!
                                  : (order?['shipping_address'] ??
                                        'Chưa có địa chỉ'),
                              textPrimary,
                              textSecondary,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // 2. Support Request & CSKH Reply Card
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: cardBg,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: cardBorder),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  Icons.assignment_outlined,
                                  size: 18,
                                  color: primary,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'THÔNG TIN YÊU CẦU & BẢO TRÌ',
                                  style: GoogleFonts.inter(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w800,
                                    color: primary,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                            const Divider(height: 18),
                            if (parsedMaintenance['request']!.isNotEmpty) ...[
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(
                                    0xFF0284C7,
                                  ).withValues(alpha: 0.08),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: const Color(
                                      0xFF0284C7,
                                    ).withValues(alpha: 0.25),
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(
                                          Icons.help_outline_rounded,
                                          size: 14,
                                          color: Color(0xFF0284C7),
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          'NỘI DUNG YÊU CẦU TỪ KHÁCH HÀNG:',
                                          style: GoogleFonts.inter(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w800,
                                            color: const Color(0xFF0284C7),
                                            letterSpacing: 0.4,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      parsedMaintenance['request']!,
                                      style: GoogleFonts.inter(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                        color: textPrimary,
                                        height: 1.4,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 10),
                            ],
                            if (parsedMaintenance['reply']!.isNotEmpty) ...[
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(
                                    0xFF16A34A,
                                  ).withValues(alpha: 0.08),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: const Color(
                                      0xFF16A34A,
                                    ).withValues(alpha: 0.25),
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(
                                          Icons.support_agent_rounded,
                                          size: 15,
                                          color: Color(0xFF16A34A),
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          'PHẢN HỒI CSKH / HƯỚNG DẪN:',
                                          style: GoogleFonts.inter(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w800,
                                            color: const Color(0xFF16A34A),
                                            letterSpacing: 0.4,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      parsedMaintenance['reply']!,
                                      style: GoogleFonts.inter(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                        color: textPrimary,
                                        height: 1.4,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                            if (parsedMaintenance['request']!.isEmpty &&
                                parsedMaintenance['reply']!.isEmpty) ...[
                              Text(
                                task['description'] != null &&
                                        task['description']
                                            .toString()
                                            .trim()
                                            .isNotEmpty
                                    ? task['description'].toString()
                                    : 'Không có ghi chú thêm',
                                style: GoogleFonts.inter(
                                  fontSize: 13,
                                  color: textSecondary,
                                  height: 1.4,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // 3. Completed Time Card
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: cardBg,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: cardBorder),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.event_available_rounded,
                              size: 16,
                              color: textSecondary,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Thời gian hoàn tất bảo trì: ',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: textSecondary,
                              ),
                            ),
                            Text(
                              completedAt != null
                                  ? completedAt
                                        .toString()
                                        .substring(0, 16)
                                        .replaceAll('T', ' ')
                                  : 'N/A',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: textPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ] else ...[
                      // Customer & Shipping Info Card (Warehouse)
                      if (order != null) ...[
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: cardBg,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: cardBorder),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    Icons.person_pin_circle_rounded,
                                    size: 18,
                                    color: primary,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'THÔNG TIN GIAO HÀNG & KHÁCH HÀNG',
                                    style: GoogleFonts.inter(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w800,
                                      color: primary,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(height: 18),
                              _buildInfoLine(
                                Icons.person_outline_rounded,
                                'Khách hàng:',
                                order['shipping_name'] ?? 'N/A',
                                textPrimary,
                                textSecondary,
                              ),
                              const SizedBox(height: 8),
                              _buildInfoLine(
                                Icons.phone_outlined,
                                'Số điện thoại:',
                                order['shipping_phone'] ?? 'N/A',
                                textPrimary,
                                textSecondary,
                              ),
                              const SizedBox(height: 8),
                              _buildInfoLine(
                                Icons.location_on_outlined,
                                'Địa chỉ:',
                                order['shipping_address'] ?? 'N/A',
                                textPrimary,
                                textSecondary,
                              ),
                              if (order['note'] != null &&
                                  order['note']
                                      .toString()
                                      .trim()
                                      .isNotEmpty) ...[
                                const SizedBox(height: 10),
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: const Color(
                                      0xFFD97706,
                                    ).withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: const Color(
                                        0xFFD97706,
                                      ).withValues(alpha: 0.25),
                                    ),
                                  ),
                                  child: Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Icon(
                                        Icons.push_pin_outlined,
                                        size: 15,
                                        color: Color(0xFFD97706),
                                      ),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(
                                          'Ghi chú: ${order['note']}',
                                          style: GoogleFonts.inter(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600,
                                            color: const Color(0xFFD97706),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                      ],

                      // Products & MAC Addresses Section (Warehouse)
                      Row(
                        children: [
                          Icon(
                            Icons.qr_code_scanner_rounded,
                            size: 18,
                            color: primary,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'SẢN PHẨM & MÃ MAC XUẤT KHO (${items.length})',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: primary,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                      if (items.isEmpty)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: cardBg,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: cardBorder),
                          ),
                          child: Text(
                            'Chưa có dữ liệu danh sách sản phẩm',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color: textSecondary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        )
                      else
                        ...items.map((item) {
                          final macs = (item['device_macs'] as List?) ?? [];
                          final price =
                              (item['product_price'] as num?)?.toDouble() ??
                              0.0;
                          final qty = (item['quantity'] as num?)?.toInt() ?? 1;

                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: cardBg,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: cardBorder),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        item['product_name'] ??
                                            'Thiết bị AquaCare',
                                        style: GoogleFonts.inter(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w700,
                                          color: textPrimary,
                                        ),
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 3,
                                      ),
                                      decoration: BoxDecoration(
                                        color: primary.withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(
                                          100,
                                        ),
                                      ),
                                      child: Text(
                                        'x$qty',
                                        style: GoogleFonts.inter(
                                          fontSize: 11.5,
                                          fontWeight: FontWeight.w800,
                                          color: primary,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                if (price > 0) ...[
                                  const SizedBox(height: 4),
                                  Text(
                                    'Đơn giá: ${_formatCurrency(price)} ₫',
                                    style: GoogleFonts.inter(
                                      fontSize: 12,
                                      color: textSecondary,
                                    ),
                                  ),
                                ],
                                const SizedBox(height: 12),
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: _isDark
                                        ? const Color(0xFF1A1A1E)
                                        : Colors.white,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: cardBorder),
                                  ),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Icon(
                                            Icons.label_outlined,
                                            size: 14,
                                            color: primary,
                                          ),
                                          const SizedBox(width: 6),
                                          Text(
                                            'Mã MAC đã dán tem xuất kho:',
                                            style: GoogleFonts.inter(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w700,
                                              color: textSecondary,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      macs.isEmpty
                                          ? Text(
                                              'Chưa ghi nhận mã MAC',
                                              style: GoogleFonts.inter(
                                                fontSize: 12,
                                                color: textSecondary,
                                                fontStyle: FontStyle.italic,
                                              ),
                                            )
                                          : Wrap(
                                              spacing: 8,
                                              runSpacing: 8,
                                              children: macs.map((m) {
                                                return Container(
                                                  padding:
                                                      const EdgeInsets.symmetric(
                                                        horizontal: 10,
                                                        vertical: 5,
                                                      ),
                                                  decoration: BoxDecoration(
                                                    color: primary.withValues(
                                                      alpha: 0.12,
                                                    ),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                          6,
                                                        ),
                                                    border: Border.all(
                                                      color: primary.withValues(
                                                        alpha: 0.3,
                                                      ),
                                                    ),
                                                  ),
                                                  child: Row(
                                                    mainAxisSize:
                                                        MainAxisSize.min,
                                                    children: [
                                                      Icon(
                                                        Icons.tag_rounded,
                                                        size: 12,
                                                        color: primary,
                                                      ),
                                                      const SizedBox(width: 4),
                                                      Text(
                                                        m.toString(),
                                                        style:
                                                            GoogleFonts.jetBrainsMono(
                                                              fontSize: 12,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w700,
                                                              color: primary,
                                                            ),
                                                      ),
                                                    ],
                                                  ),
                                                );
                                              }).toList(),
                                            ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      const SizedBox(height: 12),

                      // Timestamp Footer (Warehouse)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: cardBg,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: cardBorder),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.event_available_rounded,
                              size: 16,
                              color: textSecondary,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Thời gian hoàn tất xuất kho: ',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: textSecondary,
                              ),
                            ),
                            Text(
                              completedAt != null
                                  ? completedAt
                                        .toString()
                                        .substring(0, 16)
                                        .replaceAll('T', ' ')
                                  : 'N/A',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: textPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),

            // Bottom Action Bar
            Padding(
              padding: const EdgeInsets.all(16),
              child: SizedBox(
                width: double.infinity,
                height: 44,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    elevation: 0,
                  ),
                  onPressed: () => Navigator.pop(ctx),
                  child: Text(
                    'Đóng',
                    style: GoogleFonts.inter(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatCurrency(double val) {
    final int valInt = val.toInt();
    return valInt.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]}.',
    );
  }
}
