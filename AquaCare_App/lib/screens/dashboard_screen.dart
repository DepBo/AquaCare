import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fl_chart/fl_chart.dart';
import 'login_screen.dart';
import '../services/supabase_service.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'alerts_screen.dart';
import '../widgets/alerts_pie_chart.dart';
import 'control_screen.dart';
import '../widgets/sensor_history_drill_down.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:ui' as ui;

import '../services/fcm_service.dart';
import 'dart:math' as math;
import 'dart:convert';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
// ─────────────────── POND MODEL ─────────────────────────────
class Pond {
  String id;
  String name;
  String? volume;
  int? speciesId;
  String? macAddress;

  Pond({
    required this.id,
    required this.name,
    this.volume,
    this.speciesId,
    this.macAddress,
  });
}

// ──────────────────── SENSOR MODEL ──────────────────────────
class SensorData {
  final String name;
  final String unit;
  final double value;
  final Color color;
  final IconData icon;
  final String status;
  final List<double> history;

  const SensorData({
    required this.name,
    required this.unit,
    required this.value,
    required this.color,
    required this.icon,
    required this.status,
    required this.history,
  });
}

// ─────────────── MOCK SENSOR DATA ───────────────────────────
final List<SensorData> sensorList = [
  SensorData(
    name: 'pH',
    unit: '',
    value: 7.20,
    color: const Color(0xFF00A896),
    icon: Icons.science_outlined,
    status: 'Tốt',
    history: [7.1, 7.0, 7.2, 7.3, 7.15, 7.25, 7.20, 7.18, 7.22, 7.20],
  ),
  SensorData(
    name: 'Nhiệt độ',
    unit: '°C',
    value: 26.50,
    color: const Color(0xFFFF8C42),
    icon: Icons.thermostat_outlined,
    status: 'Tốt',
    history: [26.0, 26.3, 26.8, 27.0, 26.6, 26.4, 26.5, 26.7, 26.5, 26.5],
  ),
  SensorData(
    name: 'TDS',
    unit: 'ppm',
    value: 245.00,
    color: const Color(0xFFC77DFF),
    icon: Icons.water_drop_outlined,
    status: 'Tốt',
    history: [
      240.0,
      243.0,
      246.0,
      248.0,
      244.0,
      242.0,
      245.0,
      247.0,
      244.0,
      245.0,
    ],
  ),
  SensorData(
    name: 'Mực nước',
    unit: '',
    value: 1.0,
    color: const Color(0xFF4DA6FF),
    icon: Icons.waves_outlined,
    status: 'Ổn định',
    history: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  ),
];

// ─────────────────── ALERT MODEL ────────────────────────────
class AlertItem {
  final String title;
  final String message;
  final String time;
  final Color color;
  final IconData icon;
  final bool isWarning;

  const AlertItem({
    required this.title,
    required this.message,
    required this.time,
    required this.color,
    required this.icon,
    required this.isWarning,
  });
}

final List<AlertItem> alertList = [
  AlertItem(
    title: 'pH ổn định',
    message: 'Giá trị pH đang ở mức lý tưởng 7.2',
    time: '2 phút trước',
    color: const Color(0xFF00A896),
    icon: Icons.check_circle_outline,
    isWarning: false,
  ),
  AlertItem(
    title: 'Nhiệt độ bình thường',
    message: 'Nhiệt độ nước ổn định 26.5°C',
    time: '5 phút trước',
    color: const Color(0xFF00A896),
    icon: Icons.check_circle_outline,
    isWarning: false,
  ),
  AlertItem(
    title: 'Mực nước thấp',
    message: 'Cảnh báo cạn nước, vui lòng kiểm tra van cấp và châm thêm nước',
    time: '12 phút trước',
    color: const Color(0xFFFF6B6B),
    icon: Icons.warning_amber_outlined,
    isWarning: true,
  ),
  AlertItem(
    title: 'TDS tăng',
    message: 'Nồng độ TDS tăng lên 245 ppm, cân nhắc thay 20% nước',
    time: '30 phút trước',
    color: const Color(0xFFFF8C42),
    icon: Icons.info_outline,
    isWarning: true,
  ),
];

// ──────────────────── DASHBOARD SCREEN ──────────────────────

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with TickerProviderStateMixin {
  int _selectedTab = 0;
  late Timer _clockTimer;
  late Timer _pulseTimer;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  String _currentTime = '';
  bool _liveDot = true;
  bool _isLoading = false;
  int _selectedSensorIndex = 0;
  bool _hideOnboarding = false;
  Map<String, dynamic>? _userInfo;
  bool _isUploadingAvatar = false;

  // ── Pond State ────────────────────────────────────────────
  List<Pond> _ponds = [];
  String _activePondId = '';
  Stream<List<Map<String, dynamic>>>? _telemetryStream;
  Stream<List<Map<String, dynamic>>>? _alertsStream;
  int _unreadAlertCount = 0;
  List<Map<String, dynamic>> _fishSpecies = [];

  void _updateStream() {
    if (_activePondId.isNotEmpty) {
      _telemetryStream = SupabaseService.instance.getTelemetryStream(
        _activePondId,
      );
      _alertsStream = SupabaseService.instance.getAlertsStream(_activePondId);
    }
  }

  Pond get _activePond {
    if (_isLoading && _ponds.isEmpty) {
      return Pond(id: '', name: 'Đang đồng bộ...');
    }
    if (_ponds.isEmpty) return Pond(id: '', name: 'Chưa có bể cá');
    return _ponds.firstWhere(
      (p) => p.id == _activePondId,
      orElse: () => _ponds.first,
    );
  }

  List<SensorData> _currentSensors = [
    SensorData(
      name: 'pH',
      unit: '',
      value: 0,
      color: const Color(0xFF00A896),
      icon: Icons.science_outlined,
      status: '...',
      history: [0],
    ),
    SensorData(
      name: 'Nhiệt độ',
      unit: '°C',
      value: 0,
      color: const Color(0xFFFF8C42),
      icon: Icons.thermostat_outlined,
      status: '...',
      history: [0],
    ),
    SensorData(
      name: 'TDS',
      unit: 'ppm',
      value: 0,
      color: const Color(0xFFC77DFF),
      icon: Icons.water_drop_outlined,
      status: '...',
      history: [0],
    ),
    SensorData(
      name: 'Mực nước',
      unit: '',
      value: 0,
      color: const Color(0xFF4DA6FF),
      icon: Icons.waves_outlined,
      status: '...',
      history: [0],
    ),
  ];

  final List<String> _tabTitles = [
    'Tổng quan',
    'Cảm biến',
    'Điều khiển',
    'Cảnh báo',
  ];

  @override
  void initState() {
    super.initState();
    debugPrint('🚀 DashboardScreen đã khởi tạo');
    _updateTime();
    _clockTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _updateTime(),
    );

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 0.4, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _pulseTimer = Timer.periodic(const Duration(milliseconds: 600), (_) {
      if (mounted) setState(() => _liveDot = !_liveDot);
    });

    _loadPonds();
    _loadOnboardingPref();
    _loadUserInfo();
    _loadFishSpecies();

    FCMService.onAlertReceived = () {
      if (mounted) {
        setState(() {
          if (_selectedTab != 3) {
            _unreadAlertCount++;
          }
        });
      }
    };
  }

  Future<void> _loadUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    final userInfoStr = prefs.getString('user_info');
    if (userInfoStr != null && mounted) {
      Map<String, dynamic> parsedInfo = jsonDecode(userInfoStr);

      // Nếu full_name rỗng, thử lấy từ Supabase Auth metadata
      final storedName = (parsedInfo['full_name'] ?? parsedInfo['name'] ?? '') as String;
      final authUser = Supabase.instance.client.auth.currentUser;

      if (storedName.trim().isEmpty) {
        final metaName = authUser?.userMetadata?['full_name'] ??
            authUser?.userMetadata?['name'] ?? '';
        if (metaName.toString().trim().isNotEmpty) {
          parsedInfo['full_name'] = metaName;
        } else {
          try {
            final userId = parsedInfo['id'];
            if (userId != null) {
              final data = await Supabase.instance.client
                  .from('users')
                  .select('full_name')
                  .eq('id', userId)
                  .maybeSingle();
              final dbName = data?['full_name'] ?? '';
              if (dbName.toString().trim().isNotEmpty) {
                parsedInfo['full_name'] = dbName;
              }
            }
          } catch (e) {
            debugPrint('Error fetching full_name from DB: $e');
          }
        }
      }

      // Khôi phục avatar_url nếu backend login không trả về
      if (parsedInfo['avatar_url'] == null || parsedInfo['avatar_url'].toString().isEmpty) {
        final metaAvatar = authUser?.userMetadata?['avatar_url'] ?? authUser?.userMetadata?['picture'];
        if (metaAvatar != null && metaAvatar.toString().isNotEmpty) {
          parsedInfo['avatar_url'] = metaAvatar;
        } else {
          try {
            final userId = parsedInfo['id'];
            if (userId != null) {
              final data = await Supabase.instance.client
                  .from('users')
                  .select('avatar_url')
                  .eq('id', userId)
                  .maybeSingle();
              final dbAvatar = data?['avatar_url'] ?? '';
              if (dbAvatar.toString().trim().isNotEmpty) {
                parsedInfo['avatar_url'] = dbAvatar;
              }
            }
          } catch (e) {
            debugPrint('Error fetching avatar_url from DB: $e');
          }
        }
      }

      await prefs.setString('user_info', jsonEncode(parsedInfo));

      setState(() {
        _userInfo = parsedInfo;
      });
    }
  }

  String getInitialsAvatar(String? name) {
    if (name == null || name.isEmpty) return 'U';
    final words = name.trim().split(RegExp(r'\s+'));
    if (words.length >= 2) {
      return (words.first[0] + words.last[0]).toUpperCase();
    }
    return words.first[0].toUpperCase();
  }

  Future<void> _pickAndUploadAvatar() async {
    if (_userInfo == null) return;
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(source: ImageSource.gallery);
      if (pickedFile == null) return;

      setState(() => _isUploadingAvatar = true);

      final bytes = await pickedFile.readAsBytes();
      final fileExt = pickedFile.path.split('.').last;
      final fileName = '${_userInfo!['id']}_${DateTime.now().millisecondsSinceEpoch}.$fileExt';

      await Supabase.instance.client.storage
          .from('avatars')
          .uploadBinary(fileName, bytes, fileOptions: const FileOptions(upsert: true));

      final publicUrl = Supabase.instance.client.storage.from('avatars').getPublicUrl(fileName);

      try {
        await Supabase.instance.client.auth.updateUser(UserAttributes(data: {'avatar_url': publicUrl}));
      } catch (e) {
        debugPrint('Auth session missing, ignoring update user metadata');
      }

      try {
        await Supabase.instance.client.from('users').update({'avatar_url': publicUrl}).eq('id', _userInfo!['id']);
      } catch (e) {
        debugPrint('RLS blocked public.users update');
      }

      _userInfo!['avatar_url'] = publicUrl;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_info', jsonEncode(_userInfo));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Cập nhật ảnh đại diện thành công')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Lỗi tải ảnh lên: $e')));
      }
    } finally {
      if (mounted) setState(() => _isUploadingAvatar = false);
    }
  }

  Future<void> _loadOnboardingPref() async {
    final prefs = await SharedPreferences.getInstance();
    if (mounted) {
      setState(() {
        _hideOnboarding = prefs.getBool('hide_onboarding') ?? false;
      });
    }
  }

  Future<void> _loadPonds() async {
    setState(() => _isLoading = true);
    try {
      User? user = Supabase.instance.client.auth.currentUser;
      int retries = 0;
      while (user == null && retries < 5) {
        debugPrint('⏳ Đợi Supabase Session... ($retries/5)');
        await Future.delayed(const Duration(milliseconds: 500));
        user = Supabase.instance.client.auth.currentUser;
        retries++;
      }

      if (user == null) {
        debugPrint(
          '❌ [LỖI NGHIÊM TRỌNG]: Supabase currentUser đang là NULL! Client gửi request ẩn danh nên RLS sẽ chặn lại.',
        );
      } else {
        debugPrint('✅ [SUCCESS]: User hiện tại: ${user.id} - ${user.email}');
      }
      final currentUserId = user?.id ?? '3da8dc87-687c-4a01-970a-2d8f2c7a04c6';

      debugPrint('--- DEBUG: _loadPonds started for user: $currentUserId ---');
      final data = await SupabaseService.instance.getTanks(currentUserId);
      debugPrint('--- DEBUG: Received data from getTanks: $data ---');
      if (data.isNotEmpty) {
        setState(() {
          _ponds = data
              .map((json) {
            String? mac;
            var devicesData = json['devices'];
            if (devicesData != null) {
              if (devicesData is List && devicesData.isNotEmpty) {
                mac = devicesData[0]['mac_address'];
              } else if (devicesData is Map) {
                mac = devicesData['mac_address'];
              }
            }
            return Pond(
              id: json['id'].toString(),
              name: json['tank_name'],
              volume: json['water_volume_liter']?.toString(),
              speciesId: json['species_id'],
              macAddress: mac,
            );
          }).toList();
          _activePondId = _ponds.first.id;
          _updateStream();
        });
      }
    } catch (e) {
      print('Error loading ponds: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _loadFishSpecies() async {
    try {
      final data = await SupabaseService.instance.getFishSpecies();
      if (mounted) {
        setState(() {
          _fishSpecies = data;
        });
      }
    } catch (e) {
      debugPrint('Error loading fish species: $e');
    }
  }

  void _updateTime() {
    final now = DateTime.now();
    setState(() {
      _currentTime =
          '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    });
  }

  // ── Simulate data reload ──────────────────────────────────
  void _simulateReload() {
    setState(() => _isLoading = true);
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) setState(() => _isLoading = false);
    });
  }

  // ─────────────── POND CRUD ───────────────────────────────

  void _showAddPondDialog() {
    final ctrl = TextEditingController();
    final formKey = GlobalKey<FormState>();
    showDialog(
      context: context,
      barrierColor: Colors.black.withValues(alpha: 0.65),
      builder: (ctx) => _buildPondDialog(
        title: '➕ Thêm bể cá mới',
        confirmLabel: 'Thêm bể',
        confirmColor: const Color(0xFF00A896),
        controller: ctrl,
        formKey: formKey,
        hint: 'VD: Bể Rồng Phòng Ngủ',
        onConfirm: () {
          if (formKey.currentState!.validate()) {
            final name = ctrl.text.trim();
            final newPond = Pond(
              id: 'pond_${DateTime.now().millisecondsSinceEpoch}',
              name: name,
            );
            Navigator.pop(ctx);
            setState(() {
              _ponds.add(newPond);
              _activePondId = newPond.id;
            });
            _simulateReload();
          }
        },
      ),
    );
  }

  void _showPondSettingsDialog(Pond pond) {
    showDialog(
      context: context,
      barrierColor: Colors.black.withValues(alpha: 0.65),
      builder: (ctx) => PondSettingsDialog(
        pond: pond,
        fishSpeciesList: _fishSpecies,
        onSaved: () {
          _loadPonds();
        },
      ),
    );
  }

  void _showDeletePondDialog(Pond pond) {
    showDialog(
      context: context,
      barrierColor: Colors.black.withValues(alpha: 0.65),
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0F1A30),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
        ),
        title: Text(
          '🗑️ Xóa bể cá',
          style: GoogleFonts.inter(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        content: RichText(
          text: TextSpan(
            style: GoogleFonts.inter(
              fontSize: 13,
              color: Colors.white.withValues(alpha: 0.5),
              height: 1.6,
            ),
            children: [
              const TextSpan(text: 'Bạn có chắc muốn xóa '),
              TextSpan(
                text: '"${pond.name}"',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const TextSpan(text: '?\nHành động này không thể hoàn tác.'),
            ],
          ),
        ),
        actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            style: TextButton.styleFrom(
              foregroundColor: Colors.white.withValues(alpha: 0.5),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: Text(
              'Hủy',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              setState(() {
                _ponds.removeWhere((p) => p.id == pond.id);
                if (_activePondId == pond.id && _ponds.isNotEmpty) {
                  _activePondId = _ponds.first.id;
                }
              });
              _simulateReload();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF6B6B),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              elevation: 0,
            ),
            child: Text(
              'Xóa bể',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Shared dialog builder ─────────────────────────────────
  Widget _buildPondDialog({
    required String title,
    required String confirmLabel,
    required Color confirmColor,
    required TextEditingController controller,
    required GlobalKey<FormState> formKey,
    required String hint,
    required VoidCallback onConfirm,
  }) {
    return AlertDialog(
      backgroundColor: const Color(0xFF0F1A30),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
      ),
      title: Text(
        title,
        style: GoogleFonts.inter(
          fontSize: 17,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
      content: Form(
        key: formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'TÊN BỂ CÁ',
              style: GoogleFonts.inter(
                fontSize: 9,
                fontWeight: FontWeight.w600,
                color: Colors.white.withValues(alpha: 0.35),
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: controller,
              autofocus: true,
              style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: GoogleFonts.inter(
                  fontSize: 13,
                  color: Colors.white.withValues(alpha: 0.2),
                ),
                filled: true,
                fillColor: Colors.white.withValues(alpha: 0.04),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 12,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: Color(0xFF00A896),
                    width: 1.5,
                  ),
                ),
                errorBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFFF6B6B)),
                ),
                focusedErrorBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFFF6B6B)),
                ),
                errorStyle: GoogleFonts.inter(
                  fontSize: 11,
                  color: const Color(0xFFFF6B6B),
                ),
              ),
              onFieldSubmitted: (_) => onConfirm(),
              validator: (v) {
                if (v == null || v.trim().isEmpty) {
                  return 'Vui lòng nhập tên bể';
                }
                return null;
              },
            ),
          ],
        ),
      ),
      actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          style: TextButton.styleFrom(
            foregroundColor: Colors.white.withValues(alpha: 0.5),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          child: Text(
            'Hủy',
            style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500),
          ),
        ),
        ElevatedButton(
          onPressed: onConfirm,
          style: ElevatedButton.styleFrom(
            backgroundColor: confirmColor,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            elevation: 0,
          ),
          child: Text(
            confirmLabel,
            style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }

  // ─────────────── LOGOUT ──────────────────────────────────
  void _handleLogout() {
    showDialog(
      context: context,
      barrierColor: Colors.black.withValues(alpha: 0.6),
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0F1A30),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.white.withValues(alpha: 0.08), width: 1),
        ),
        title: Text(
          'Đăng xuất',
          style: GoogleFonts.inter(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        content: Text(
          'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
          style: GoogleFonts.inter(
            fontSize: 13,
            color: Colors.white.withValues(alpha: 0.5),
            height: 1.5,
          ),
        ),
        actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            style: TextButton.styleFrom(
              foregroundColor: Colors.white.withValues(alpha: 0.5),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: Text(
              'Hủy',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pushAndRemoveUntil(
                context,
                PageRouteBuilder(
                  pageBuilder: (_, _, _) => const LoginScreen(),
                  transitionsBuilder: (_, anim, _, child) =>
                      FadeTransition(opacity: anim, child: child),
                  transitionDuration: const Duration(milliseconds: 350),
                ),
                (route) => false,
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF6B6B),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              elevation: 0,
            ),
            child: Text(
              'Đăng xuất',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _clockTimer.cancel();
    _pulseTimer.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            transform: GradientRotation(135 * pi / 180),
            colors: [Color(0xFF060E1A), Color(0xFF0A1628), Color(0xFF0D2235)],
            stops: [0.0, 0.5, 1.0],
          ),
        ),
        child: SafeArea(
          child: Stack(
            children: [
              Column(
                children: [
                  _buildTopBar(),
                  Expanded(
                    child: AnimatedOpacity(
                      opacity: _isLoading ? 0.35 : 1.0,
                      duration: const Duration(milliseconds: 250),
                      child: _activePondId.isEmpty
                          ? _buildOnboardingSection()
                          : StreamBuilder<List<Map<String, dynamic>>>(
                              stream: _telemetryStream,
                              builder: (context, snapshot) {
                                if (snapshot.connectionState ==
                                    ConnectionState.waiting) {
                                  return const Center(
                                    child: CircularProgressIndicator(
                                      color: Color(0xFF00A896),
                                    ),
                                  );
                                }

                                final logs = snapshot.data ?? [];
                                // debugPrint('🔔 [REALTIME]: Nhận data mới lúc: ${DateTime.now()} - ${logs.length} bản ghi');

                                List<double> phHistory = [];
                                List<double> tempHistory = [];
                                List<double> tdsHistory = [];
                                List<double> waterLevelHistory = [];

                                for (var log in logs.reversed) {
                                  try {
                                    phHistory.add(
                                      (log['ph'] as num?)?.toDouble() ?? 7.0,
                                    );
                                    tempHistory.add(
                                      (log['temp'] as num?)?.toDouble() ?? 26.0,
                                    );
                                    tdsHistory.add(
                                      (log['tds'] as num?)?.toDouble() ?? 250.0,
                                    );
                                    waterLevelHistory.add(
                                      log['water_level_ok'] == true ? 1.0 : 0.0,
                                    );
                                  } catch (e) {
                                    debugPrint(
                                      '❌ [DB ERROR]: Lỗi khi map dữ liệu từ log: $e',
                                    );
                                  }
                                }

                                if (phHistory.isEmpty) phHistory = [7.0];
                                if (tempHistory.isEmpty) tempHistory = [26.0];
                                if (tdsHistory.isEmpty) tdsHistory = [250.0];
                                if (waterLevelHistory.isEmpty) {
                                  waterLevelHistory = [1.0];
                                }

                                // Cập nhật state biến _currentSensors trực tiếp trong quá trình build
                                _currentSensors = [
                                  SensorData(
                                    name: 'pH',
                                    unit: '',
                                    value: phHistory.last,
                                    color: const Color(0xFF00A896),
                                    icon: Icons.science_outlined,
                                    status: 'Tốt',
                                    history: phHistory,
                                  ),
                                  SensorData(
                                    name: 'Nhiệt độ',
                                    unit: '°C',
                                    value: tempHistory.last,
                                    color: const Color(0xFFFF8C42),
                                    icon: Icons.thermostat_outlined,
                                    status: 'Tốt',
                                    history: tempHistory,
                                  ),
                                  SensorData(
                                    name: 'TDS',
                                    unit: 'ppm',
                                    value: tdsHistory.last,
                                    color: const Color(0xFFC77DFF),
                                    icon: Icons.water_drop_outlined,
                                    status: 'Tốt',
                                    history: tdsHistory,
                                  ),
                                  SensorData(
                                    name: 'Mực nước',
                                    unit: '',
                                    value: waterLevelHistory.last,
                                    color: const Color(0xFF4DA6FF),
                                    icon: Icons.waves_outlined,
                                    status: waterLevelHistory.last == 1.0
                                        ? 'Ổn định'
                                        : 'Cạn nước',
                                    history: waterLevelHistory,
                                  ),
                                ];

                                return _buildTabContent();
                              },
                            ),
                    ),
                  ),
                ],
              ),
              // Loading overlay
              if (_isLoading)
                Positioned.fill(
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const SizedBox(
                          width: 28,
                          height: 28,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Color(0xFF00A896),
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'Đang đồng bộ dữ liệu...',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: Colors.white.withValues(alpha: 0.5),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildFeatureRow(String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 2),
            child: Icon(Icons.widgets, size: 12, color: Color(0xFF00A896)),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: GoogleFonts.inter(fontSize: 13, color: Colors.white70, height: 1.5),
                children: [
                  TextSpan(text: '$title ', style: const TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
                  TextSpan(text: desc),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOnboardingSection() {
    bool isOverlay = !_hideOnboarding;
    
    Widget content = Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (isOverlay) ...[
          Text('Chào mừng đến với AquaCare!', 
            style: GoogleFonts.inter(fontSize: 26, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -0.5),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text('Hệ thống giám sát và điều khiển hồ cá thông minh. Hãy cùng tìm hiểu nhanh các chức năng chính để bắt đầu.',
              style: GoogleFonts.inter(fontSize: 14, color: Colors.white70, height: 1.5),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 32),
        ],
        // Card 1
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 24),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: const Color(0xFF0F1A30),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF00A896).withValues(alpha: 0.3)),
            boxShadow: isOverlay ? [const BoxShadow(color: Colors.black54, blurRadius: 24, offset: Offset(0, 8))] : [],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 36, height: 36,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFF00A896), Color(0xFF028090)]),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: Text('1', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white)),
                  ),
                  const SizedBox(width: 12),
                  Text('Khám phá tính năng', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
                ],
              ),
              const SizedBox(height: 16),
              _buildFeatureRow('Tổng quan:', 'Theo dõi trạng thái chung.'),
              _buildFeatureRow('Cảm biến:', 'Phân tích biểu đồ dữ liệu.'),
              _buildFeatureRow('Điều khiển:', 'Điều khiển thiết bị từ xa.'),
              _buildFeatureRow('Cảnh báo:', 'Quản lý thông báo quan trọng.'),
            ],
          ),
        ),
        const SizedBox(height: 20),
        // Card 2
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 24),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: const Color(0xFF0F1A30),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF4DA6FF).withValues(alpha: 0.3)),
            boxShadow: isOverlay ? [const BoxShadow(color: Colors.black54, blurRadius: 24, offset: Offset(0, 8))] : [],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 36, height: 36,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFF4DA6FF), Color(0xFF0066CC)]),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: Text('2', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white)),
                  ),
                  const SizedBox(width: 12),
                  Text('Bắt đầu sử dụng', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
                ],
              ),
              const SizedBox(height: 12),
              Text('Để trải nghiệm đầy đủ các tính năng, hãy tạo bể cá đầu tiên của bạn.',
                style: GoogleFonts.inter(fontSize: 13, color: Colors.white70, height: 1.5),
              ),
              if (!isOverlay) ...[
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _showAddPondDialog,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00A896),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text('+ Thêm bể cá mới', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white)),
                  ),
                ),
              ],
            ],
          ),
        ),
        
        if (isOverlay) ...[
          const SizedBox(height: 32),
          GestureDetector(
            onTap: () async {
              final prefs = await SharedPreferences.getInstance();
              await prefs.setBool('hide_onboarding', true);
              setState(() {
                _hideOnboarding = true;
              });
            },
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 20, height: 20,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.white54),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(width: 10),
                Text('Không hiển thị lại', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.white)),
              ],
            ),
          ),
        ],
      ],
    );

    if (!isOverlay) {
      return Center(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 40),
            child: content,
          ),
        ),
      );
    }

    return Container(
      color: Colors.black.withValues(alpha: 0.85),
      child: Stack(
        children: [
          // Arrow up (to "Chọn bể cá")
          Positioned(
            top: 10, right: 60,
            width: 80, height: 60,
            child: CustomPaint(
              painter: ArrowPainter(color: const Color(0xFF4DA6FF), pointUp: true),
            ),
          ),
          // Arrow down (to Bottom Tabs)
          Positioned(
            bottom: 10, left: 40,
            width: 80, height: 80,
            child: CustomPaint(
              painter: ArrowPainter(color: const Color(0xFF00A896), pointUp: false),
            ),
          ),
          Center(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 40),
                child: content,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ───────────────── TOP BAR ──────────────────────────────
  Widget _buildTopBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 14, 16, 10),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Colors.white.withValues(alpha: 0.05), width: 1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Avatar
              GestureDetector(
                onTap: _pickAndUploadAvatar,
                child: Stack(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFF00E5A0).withValues(alpha: 0.5), width: 1.5),
                        gradient: _userInfo?['avatar_url'] != null ? null : const LinearGradient(
                          colors: [Color(0xFF1B4F72), Color(0xFF00A896)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        image: _userInfo?['avatar_url'] != null ? DecorationImage(
                          image: NetworkImage(_userInfo!['avatar_url']),
                          fit: BoxFit.cover,
                        ) : null,
                      ),
                      child: _userInfo?['avatar_url'] == null ? Center(
                        child: Text(
                          getInitialsAvatar(_userInfo?['full_name'] ?? _userInfo?['name']),
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ) : null,
                    ),
                    if (_isUploadingAvatar)
                      Positioned.fill(
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.black54,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Center(
                            child: SizedBox(
                              width: 16, height: 16,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 12),

              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _tabTitles[_selectedTab],
                      style: GoogleFonts.inter(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: -0.4,
                      ),
                    ),
                    Text(
                      'Cập nhật lúc $_currentTime',
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        color: Colors.white.withValues(alpha: 0.3),
                      ),
                    ),
                  ],
                ),
              ),

              // Live + Logout
              Row(
                children: [
                  AnimatedBuilder(
                    animation: _pulseAnimation,
                    builder: (context, child) => Container(
                      width: 7,
                      height: 7,
                      decoration: BoxDecoration(
                        color: _isLoading
                            ? const Color(
                                0xFFFFB347,
                              ).withValues(alpha: _pulseAnimation.value)
                            : const Color(
                                0xFF00E5A0,
                              ).withValues(alpha: _pulseAnimation.value),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color:
                                (_isLoading
                                        ? const Color(0xFFFFB347)
                                        : const Color(0xFF00E5A0))
                                    .withValues(alpha: _pulseAnimation.value * 0.6),
                            blurRadius: 5,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 5),
                  Text(
                    _isLoading ? 'Sync' : 'Live',
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: _isLoading
                          ? const Color(0xFFFFB347)
                          : const Color(0xFF00E5A0),
                      letterSpacing: 0.4,
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _handleLogout,
                    icon: Icon(
                      Icons.logout_rounded,
                      size: 19,
                      color: Colors.white.withValues(alpha: 0.45),
                    ),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(
                      minWidth: 30,
                      minHeight: 30,
                    ),
                    tooltip: 'Đăng xuất',
                    splashRadius: 18,
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 12),

          // ── Pond Selector Row ──────────────────────────────
          Row(
            children: [
              Text(
                'Bể cá:',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: Colors.white.withValues(alpha: 0.35),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(child: _buildPondSelector()),
              const SizedBox(width: 8),
              // Add pond button
              GestureDetector(
                onTap: _showAddPondDialog,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: const Color(0xFF00A896).withValues(alpha: 0.3),
                      style: BorderStyle.solid,
                    ),
                    color: const Color(0xFF00A896).withValues(alpha: 0.06),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.add,
                        size: 13,
                        color: const Color(0xFF00A896).withValues(alpha: 0.8),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Thêm bể',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: const Color(0xFF00A896).withValues(alpha: 0.8),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── Pond Selector (PopupMenuButton) ──────────────────────
  Widget _buildPondSelector() {
    return PopupMenuButton<String>(
      onSelected: (id) {
        if (id == '__add__') {
          _showAddPondDialog();
        } else {
          setState(() {
            _activePondId = id;
            _updateStream();
          });
          _simulateReload();
        }
      },
      color: const Color(0xFF0F1A30),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
      ),
      elevation: 10,
      offset: const Offset(0, 8),
      itemBuilder: (ctx) => [
        // Pond items
        ..._ponds.map(
          (pond) => PopupMenuItem<String>(
            value: pond.id,
            padding: EdgeInsets.zero,
            child: _PondMenuItem(
              pond: pond,
              isActive: pond.id == _activePondId,
              onSelect: () {
                // Pass value via pop to trigger onSelected on PopupMenuButton
                Navigator.pop(ctx, pond.id);
              },
              onSettings: () {
                Navigator.pop(ctx);
                _showPondSettingsDialog(pond);
              },
              onDelete: _ponds.length > 1
                  ? () {
                      Navigator.pop(ctx);
                      _showDeletePondDialog(pond);
                    }
                  : null,
            ),
          ),
        ),
        // Divider
        const PopupMenuDivider(height: 1),
        // Add item
        PopupMenuItem<String>(
          value: '__add__',
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          child: Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: const Color(0xFF00A896).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.add,
                  size: 16,
                  color: Color(0xFF00A896),
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'Thêm bể mới',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: const Color(0xFF00A896),
                ),
              ),
            ],
          ),
        ),
      ],
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.white.withValues(alpha: 0.10)),
        ),
        child: Row(
          children: [
            Icon(
              Icons.water,
              size: 13,
              color: const Color(0xFF00A896).withValues(alpha: 0.8),
            ),
            const SizedBox(width: 7),
            Expanded(
              child: Text(
                _activePond.name,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF00A896),
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.expand_more_rounded,
              size: 16,
              color: Colors.white.withValues(alpha: 0.35),
            ),
          ],
        ),
      ),
    );
  }

  // ─────────────── BOTTOM NAV BAR ─────────────────────────
  Widget _buildBottomNav() {
    final items = [
      {'icon': Icons.home_rounded, 'label': 'Tổng quan'},
      {'icon': Icons.analytics_rounded, 'label': 'Cảm biến'},
      {'icon': Icons.power_settings_new_rounded, 'label': 'Điều khiển'},
      {'icon': Icons.notifications_rounded, 'label': 'Cảnh báo'},
    ];

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF060E1A).withValues(alpha: 0.95),
        border: Border(
          top: BorderSide(color: Colors.white.withValues(alpha: 0.06), width: 1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(items.length, (i) {
              final isSelected = _selectedTab == i;
              return GestureDetector(
                onTap: () {
                  setState(() => _selectedTab = i);
                  // Reset badge khi bấm vào tab Cảnh báo
                  if (i == 3) {
                    setState(() => _unreadAlertCount = 0);
                  }
                },
                behavior: HitTestBehavior.opaque,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  curve: Curves.easeOut,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? const Color(0xFF00A896).withValues(alpha: 0.12)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(14),
                    border: isSelected
                        ? Border.all(
                            color: const Color(0xFF00A896).withValues(alpha: 0.25),
                            width: 1,
                          )
                        : null,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Stack(
                        clipBehavior: Clip.none,
                        children: [
                          Icon(
                            items[i]['icon'] as IconData,
                            size: 22,
                            color: isSelected
                                ? const Color(0xFF00A896)
                                : Colors.white.withValues(alpha: 0.3),
                          ),
                          // Badge cho tab Cảnh báo
                          if (i == 3 && _unreadAlertCount > 0)
                            Positioned(
                              right: -8,
                              top: -4,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 4,
                                  vertical: 1,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFF6B6B),
                                  borderRadius: BorderRadius.circular(8),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(
                                        0xFFFF6B6B,
                                      ).withValues(alpha: 0.4),
                                      blurRadius: 6,
                                    ),
                                  ],
                                ),
                                child: Text(
                                  _unreadAlertCount > 99
                                      ? '99+'
                                      : '$_unreadAlertCount',
                                  style: GoogleFonts.inter(
                                    fontSize: 8,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        items[i]['label'] as String,
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: isSelected
                              ? FontWeight.w600
                              : FontWeight.w400,
                          color: isSelected
                              ? const Color(0xFF00A896)
                              : Colors.white.withValues(alpha: 0.3),
                          letterSpacing: 0.2,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }

  // ─────────────── TAB CONTENT ─────────────────────────────
  Widget _buildTabContent() {
    return IndexedStack(
      index: _selectedTab,
      children: [
        _buildOverviewTab(),
        _buildSensorsTab(),
        ControlScreen(tankId: _activePondId),
        _buildAlertsTab(),
      ],
    );
  }

  // ══════════════════════════════════════════════════════════
  //                    TAB: TỔNG QUAN
  // ══════════════════════════════════════════════════════════
  Widget _buildOverviewTab() {
    return CustomScrollView(
      physics: const BouncingScrollPhysics(),
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
            child: _buildSummaryBanner(),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 14),
            child: Row(
              children: [
                Text(
                  'Cảm biến theo dõi',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.white.withValues(alpha: 0.7),
                    letterSpacing: 0.1,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF00A896).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: const Color(0xFF00A896).withValues(alpha: 0.2),
                    ),
                  ),
                  child: Text(
                    '4 hoạt động',
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF00A896),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 14,
              crossAxisSpacing: 14,
              childAspectRatio: 0.82,
            ),
            delegate: SliverChildBuilderDelegate(
              (ctx, i) => SensorCard(sensor: _currentSensors[i]),
              childCount: _currentSensors.length,
            ),
          ),
        ),
        if (_alertsStream != null)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.only(top: 8),
              child: AlertsPieChart(
                tankId: _activePondId,
                alertsStream: _alertsStream!,
              ),
            ),
          ),
        const SliverToBoxAdapter(child: SizedBox(height: 24)),
      ],
    );
  }

  Widget _buildSummaryBanner() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF00A896).withValues(alpha: 0.12),
            const Color(0xFF1B4F72).withValues(alpha: 0.12),
          ],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF00A896).withValues(alpha: 0.15)),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFF00A896).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(
              Icons.check_circle_outline,
              color: Color(0xFF00A896),
              size: 26,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _activePond.name,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),
                Text(
                  'Tất cả 4 cảm biến trong ngưỡng an toàn',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: Colors.white.withValues(alpha: 0.4),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  //                   TAB: CẢM BIẾN
  // ══════════════════════════════════════════════════════════
  Widget _buildSensorsTab() {
    if (_currentSensors.isEmpty) return const SizedBox();
    
    return CustomScrollView(
      physics: const BouncingScrollPhysics(),
      slivers: [
        // Thanh bộ lọc ngang các cảm biến
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 16),
            child: SizedBox(
              height: 40,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _currentSensors.length,
                itemBuilder: (ctx, i) {
                  final s = _currentSensors[i];
                  final isSelected = i == _selectedSensorIndex;
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedSensorIndex = i;
                      });
                    },
                    child: Container(
                      margin: const EdgeInsets.only(right: 12),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: isSelected ? s.color.withValues(alpha: 0.15) : Colors.transparent,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected ? s.color : Colors.white.withValues(alpha: 0.1),
                          width: 1,
                        ),
                      ),
                      alignment: Alignment.center,
                      child: Row(
                        children: [
                          Icon(s.icon, size: 16, color: isSelected ? s.color : Colors.white54),
                          const SizedBox(width: 6),
                          Text(
                            s.name,
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                              color: isSelected ? s.color : Colors.white54,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ),
        
        // Thẻ cảm biến được chọn
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SensorDetailCard(sensor: _currentSensors[_selectedSensorIndex]),
          ),
        ),

        // Lịch sử dữ liệu Drill-down
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
            child: SensorHistoryDrillDown(
              activePondId: _activePondId,
              sensor: _currentSensors[_selectedSensorIndex],
            ),
          ),
        ),
      ],
    );
  }

  // ══════════════════════════════════════════════════════════
  //                   TAB: CẢNH BÁO
  // ══════════════════════════════════════════════════════════
  Widget _buildAlertsTab() {
    return AlertsScreen(key: ValueKey(_activePondId), tankId: _activePondId);
  }
}

// ════════════════════════════════════════════════════════════
//                 POND MENU ITEM WIDGET
// ════════════════════════════════════════════════════════════
class _PondMenuItem extends StatelessWidget {
  final Pond pond;
  final bool isActive;
  final VoidCallback onSelect;
  final VoidCallback onSettings;
  final VoidCallback? onDelete;

  const _PondMenuItem({
    required this.pond,
    required this.isActive,
    required this.onSelect,
    required this.onSettings,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: isActive
            ? const Color(0xFF00A896).withValues(alpha: 0.10)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          // Check mark
          Padding(
            padding: const EdgeInsets.only(left: 10),
            child: isActive
                ? const Icon(
                    Icons.check_rounded,
                    size: 14,
                    color: Color(0xFF00A896),
                  )
                : const SizedBox(width: 14),
          ),
          // Name (tap area = select)
          Expanded(
            child: InkWell(
              onTap: onSelect,
              borderRadius: BorderRadius.circular(10),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 12,
                ),
                child: Text(
                  pond.name,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                    color: isActive
                        ? const Color(0xFF00A896)
                        : Colors.white.withValues(alpha: 0.7),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ),
          ),
          // Action buttons
          IconButton(
            onPressed: onSettings,
            icon: Icon(
              Icons.edit,
              size: 15,
              color: Colors.white.withValues(alpha: 0.3),
            ),
            tooltip: 'Cấu hình',
            splashRadius: 16,
            padding: const EdgeInsets.all(6),
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          ),
          IconButton(
            onPressed: onDelete,
            icon: Icon(
              Icons.delete_outline,
              size: 15,
              color: onDelete != null
                  ? Colors.white.withValues(alpha: 0.3)
                  : Colors.white.withValues(alpha: 0.1),
            ),
            tooltip: onDelete != null ? 'Xóa' : 'Cần ít nhất 1 bể',
            splashRadius: 16,
            padding: const EdgeInsets.all(6),
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          ),
          const SizedBox(width: 4),
        ],
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════
//                     SENSOR CARD (Grid)
// ════════════════════════════════════════════════════════════
class SensorCard extends StatelessWidget {
  final SensorData sensor;
  const SensorCard({super.key, required this.sensor});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0F1A30).withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: sensor.color.withValues(alpha: 0.15), width: 1),
        boxShadow: [
          BoxShadow(
            color: sensor.color.withValues(alpha: 0.05),
            blurRadius: 16,
            spreadRadius: 0,
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: sensor.color.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(sensor.icon, color: sensor.color, size: 16),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(
                      sensor.name,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Colors.white.withValues(alpha: 0.5),
                        letterSpacing: 0.1,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 7,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF00A896).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(5),
                    border: Border.all(
                      color: const Color(0xFF00A896).withValues(alpha: 0.2),
                      width: 1,
                    ),
                  ),
                  child: Text(
                    sensor.status,
                    style: GoogleFonts.inter(
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF00A896),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            RichText(
              text: TextSpan(
                children: [
                  if (sensor.name == 'Mực nước')
                    TextSpan(
                      text: sensor.value == 1.0 ? 'Ổn định' : 'Cạn nước',
                      style: GoogleFonts.inter(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: sensor.value == 1.0
                            ? const Color(0xFF00A896)
                            : const Color(0xFFFF6B6B),
                        height: 1.0,
                      ),
                    )
                  else
                    TextSpan(
                      text: sensor.value.toStringAsFixed(2),
                      style: GoogleFonts.inter(
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        color: sensor.color,
                        height: 1.0,
                      ),
                    ),
                  if (sensor.unit.isNotEmpty && sensor.name != 'Mực nước')
                    TextSpan(
                      text: ' ${sensor.unit}',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: sensor.color.withValues(alpha: 0.6),
                      ),
                    ),
                ],
              ),
            ),
            const Spacer(),
            if (sensor.name == 'Mực nước')
              Container(
                height: 42,
                alignment: Alignment.center,
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 8,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: FractionallySizedBox(
                          alignment: Alignment.centerLeft,
                          widthFactor: sensor.value == 1.0 ? 1.0 : 0.15,
                          child: Container(
                            decoration: BoxDecoration(
                              color: sensor.value == 1.0
                                  ? const Color(0xFF00A896)
                                  : const Color(0xFFFF6B6B),
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              )
            else
              SizedBox(
                height: 42,
                child: SparklineChart(
                  data: sensor.history,
                  color: sensor.color,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════
//                   SPARKLINE CHART
// ════════════════════════════════════════════════════════════
class SparklineChart extends StatelessWidget {
  final List<double> data;
  final Color color;

  const SparklineChart({super.key, required this.data, required this.color});

  @override
  Widget build(BuildContext context) {
    final spots = data.asMap().entries.map((e) {
      return FlSpot(e.key.toDouble(), e.value);
    }).toList();

    final minY = data.reduce(min);
    final maxY = data.reduce(max);
    final padding = (maxY - minY) * 0.3;

    return LineChart(
      LineChartData(
        gridData: const FlGridData(show: false),
        titlesData: const FlTitlesData(show: false),
        borderData: FlBorderData(show: false),
        minX: 0,
        maxX: (data.length - 1).toDouble(),
        minY: minY - padding,
        maxY: maxY + padding,
        lineTouchData: const LineTouchData(enabled: false),
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            curveSmoothness: 0.35,
            color: color,
            barWidth: 2,
            isStrokeCapRound: true,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [color.withValues(alpha: 0.25), color.withValues(alpha: 0.0)],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════
//                 SENSOR DETAIL CARD (List)
// ════════════════════════════════════════════════════════════
class SensorDetailCard extends StatelessWidget {
  final SensorData sensor;
  const SensorDetailCard({super.key, required this.sensor});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0F1A30).withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: sensor.color.withValues(alpha: 0.15), width: 1),
        boxShadow: [
          BoxShadow(
            color: sensor.color.withValues(alpha: 0.05),
            blurRadius: 20,
            spreadRadius: 0,
          ),
        ],
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: sensor.color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(sensor.icon, color: sensor.color, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      sensor.name,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Thời gian thực',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: Colors.white.withValues(alpha: 0.3),
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    sensor.name == 'Mực nước'
                        ? (sensor.value == 1.0 ? 'Bình thường' : 'Cạn')
                        : '${sensor.value.toStringAsFixed(2)}${sensor.unit.isNotEmpty ? ' ${sensor.unit}' : ''}',
                    style: GoogleFonts.inter(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: sensor.name == 'Mực nước'
                          ? (sensor.value == 1.0
                                ? const Color(0xFF00A896)
                                : const Color(0xFFFF6B6B))
                          : sensor.color,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFF00A896).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: const Color(0xFF00A896).withValues(alpha: 0.2),
                      ),
                    ),
                    child: Text(
                      sensor.status,
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF00A896),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 18),
          if (sensor.name == 'Mực nước')
            Container(
              height: 120,
              alignment: Alignment.center,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    sensor.value == 1.0
                        ? Icons.check_circle_outline
                        : Icons.warning_amber_rounded,
                    size: 48,
                    color: sensor.value == 1.0
                        ? const Color(0xFF00A896)
                        : const Color(0xFFFF6B6B),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    sensor.value == 1.0
                        ? 'Mực nước đang ở mức ổn định'
                        : 'Cảnh báo: Bể đang cạn nước!',
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: sensor.value == 1.0
                          ? const Color(0xFF00A896)
                          : const Color(0xFFFF6B6B),
                    ),
                  ),
                ],
              ),
            )
          else
            Column(
              children: [
                SizedBox(
                  height: 80,
                  child: SparklineChart(
                    data: sensor.history,
                    color: sensor.color,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _statChip(
                      'Min',
                      sensor.history.reduce(min).toStringAsFixed(2),
                      sensor.color,
                    ),
                    const SizedBox(width: 10),
                    _statChip(
                      'Max',
                      sensor.history.reduce(max).toStringAsFixed(2),
                      sensor.color,
                    ),
                    const SizedBox(width: 10),
                    _statChip(
                      'Avg',
                      (sensor.history.reduce((a, b) => a + b) /
                              sensor.history.length)
                          .toStringAsFixed(2),
                      sensor.color,
                    ),
                  ],
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _statChip(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withValues(alpha: 0.1)),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 9,
                fontWeight: FontWeight.w600,
                color: Colors.white.withValues(alpha: 0.3),
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════
//                   ARROW PAINTER (ONBOARDING)
// ════════════════════════════════════════════════════════════
class ArrowPainter extends CustomPainter {
  final Color color;
  final bool pointUp;

  ArrowPainter({required this.color, required this.pointUp});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path();
    if (pointUp) {
      // Curve up to top right
      path.moveTo(0, size.height);
      path.quadraticBezierTo(size.width * 0.5, size.height, size.width, 0);
      
      // Draw arrow head at (size.width, 0)
      final headLength = 12.0;
      final angle = math.atan2(-size.height, size.width * 0.5); // Approx tangent
      canvas.drawLine(Offset(size.width, 0), Offset(size.width - headLength * math.cos(angle - math.pi/6), 0 - headLength * math.sin(angle - math.pi/6)), paint);
      canvas.drawLine(Offset(size.width, 0), Offset(size.width - headLength * math.cos(angle + math.pi/6), 0 - headLength * math.sin(angle + math.pi/6)), paint);
    } else {
      // Curve down to bottom left
      path.moveTo(size.width, 0);
      path.quadraticBezierTo(size.width * 0.5, 0, 0, size.height);
      
      // Draw arrow head at (0, size.height)
      final headLength = 12.0;
      final angle = math.atan2(size.height, -size.width * 0.5); // Approx tangent
      canvas.drawLine(Offset(0, size.height), Offset(0 - headLength * math.cos(angle - math.pi/6), size.height - headLength * math.sin(angle - math.pi/6)), paint);
      canvas.drawLine(Offset(0, size.height), Offset(0 - headLength * math.cos(angle + math.pi/6), size.height - headLength * math.sin(angle + math.pi/6)), paint);
    }

    // Draw dashed path
    double dashWidth = 8, dashSpace = 8, distance = 0;
    for (ui.PathMetric pathMetric in path.computeMetrics()) {
      while (distance < pathMetric.length) {
        final extractPath = pathMetric.extractPath(distance, distance + dashWidth);
        canvas.drawPath(extractPath, paint);
        distance += dashWidth + dashSpace;
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class PondSettingsDialog extends StatefulWidget {
  final Pond pond;
  final List<Map<String, dynamic>> fishSpeciesList;
  final VoidCallback onSaved;

  const PondSettingsDialog({
    super.key,
    required this.pond,
    required this.fishSpeciesList,
    required this.onSaved,
  });

  @override
  State<PondSettingsDialog> createState() => _PondSettingsDialogState();
}

class _PondSettingsDialogState extends State<PondSettingsDialog> {
  int _tabIndex = 0; // 0 = Chung, 1 = Cảnh báo
  bool _isLoading = false;
  String _errorMsg = '';

  // Chung state
  late TextEditingController _nameCtrl;
  late TextEditingController _volumeCtrl;
  late TextEditingController _macCtrl;
  int? _speciesId;

  // Cảnh báo state
  bool _email = false;
  bool _web = false;
  bool _app = true;
  int _cooldown = 15;
  String _severity = 'both'; 

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.pond.name);
    _volumeCtrl = TextEditingController(text: widget.pond.volume ?? '');
    _macCtrl = TextEditingController(text: widget.pond.macAddress ?? '');
    _speciesId = widget.pond.speciesId;
    _loadNotificationSettings();
  }

  Future<void> _loadNotificationSettings() async {
    try {
      final res = await SupabaseService.instance.client
          .from('tank_notification_settings')
          .select('*')
          .eq('tank_id', int.parse(widget.pond.id))
          .maybeSingle();

      if (res != null && mounted) {
        setState(() {
          _email = res['notify_via_email'] ?? false;
          _web = res['notify_via_web_push'] ?? false;
          _app = res['notify_via_app_noti'] ?? true;
          final rawCooldown = res['alert_cooldown_minutes'] ?? 15;
          // Ensure cooldown value exists in dropdown options
          const validCooldowns = [0, 1, 15, 30, 60];
          _cooldown = validCooldowns.contains(rawCooldown) ? rawCooldown : 15;
          final rawSeverity = res['alert_severity_preference'] ?? 'both';
          // Ensure severity value exists in dropdown options
          const validSeverities = ['both', 'critical_only', 'warning_only', 'none'];
          _severity = validSeverities.contains(rawSeverity) ? rawSeverity : 'both';
        });
      }
    } catch (e) {
      debugPrint('Error loading notif settings: $e');
    }
  }

  Future<void> _saveSettings() async {
    if (_nameCtrl.text.trim().isEmpty) {
      setState(() => _errorMsg = 'Tên bể không được để trống');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMsg = '';
    });

    try {
      final tankId = int.parse(widget.pond.id);
      
      // Update tanks
      await SupabaseService.instance.client.from('tanks').update({
        'tank_name': _nameCtrl.text.trim(),
        'water_volume_liter': _volumeCtrl.text.trim().isNotEmpty ? double.tryParse(_volumeCtrl.text.trim()) : null,
        'species_id': _speciesId,
      }).eq('id', tankId);

      // Update mac address
      final mac = _macCtrl.text.trim();
      if (mac != widget.pond.macAddress) {
        if (widget.pond.macAddress != null && widget.pond.macAddress!.isNotEmpty) {
           await SupabaseService.instance.client.from('devices').update({'tank_id': null}).eq('mac_address', widget.pond.macAddress!);
        }
        if (mac.isNotEmpty) {
           final existingDevice = await SupabaseService.instance.client
               .from('devices')
               .select('id')
               .eq('mac_address', mac)
               .maybeSingle();
           if (existingDevice != null) {
               await SupabaseService.instance.client.from('devices').update({'tank_id': tankId}).eq('mac_address', mac);
           } else {
               throw Exception('Không tìm thấy thiết bị với địa chỉ MAC này.');
           }
        }
      }

      // Update notif settings
      await SupabaseService.instance.client.from('tank_notification_settings').upsert({
        'tank_id': tankId,
        'notify_via_email': _email,
        'notify_via_web_push': _web,
        'notify_via_app_noti': _app,
        'alert_cooldown_minutes': _cooldown,
        'alert_severity_preference': _severity,
        'updated_at': DateTime.now().toIso8601String(),
      });

      widget.onSaved();
      if (mounted) {
         Navigator.pop(context);
      }
    } catch (e) {
      setState(() {
         _errorMsg = e.toString().replaceAll('Exception:', '').trim();
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _volumeCtrl.dispose();
    _macCtrl.dispose();
    super.dispose();
  }

  Widget _buildTextField(String label, TextEditingController controller, {String? hint, TextInputType? type}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white70)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: type,
          style: GoogleFonts.inter(fontSize: 14, color: Colors.white),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: GoogleFonts.inter(color: Colors.white30),
            filled: true,
            fillColor: Colors.white.withValues(alpha: 0.04),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF00A896)),
            ),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildDropdown<T>(String label, T? value, List<DropdownMenuItem<T>> items, ValueChanged<T?> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white70)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.04),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<T>(
              value: value,
              items: items,
              onChanged: onChanged,
              isExpanded: true,
              dropdownColor: const Color(0xFF152238),
              style: GoogleFonts.inter(fontSize: 14, color: Colors.white),
              icon: const Icon(Icons.arrow_drop_down, color: Colors.white54),
            ),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildSwitch(String label, bool value, ValueChanged<bool> onChanged) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: GoogleFonts.inter(fontSize: 14, color: Colors.white)),
        Switch(
          value: value,
          onChanged: onChanged,
          activeThumbColor: const Color(0xFF00A896),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF0F1A30),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Container(
        width: 400,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Cấu hình bể cá',
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 20),
            // Tabs
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _tabIndex = 0),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        border: Border(bottom: BorderSide(color: _tabIndex == 0 ? const Color(0xFF4DA6FF) : Colors.transparent, width: 2)),
                      ),
                      child: Text(
                        'Thông tin chung',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: _tabIndex == 0 ? FontWeight.w600 : FontWeight.w400,
                          color: _tabIndex == 0 ? const Color(0xFF4DA6FF) : Colors.white54,
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _tabIndex = 1),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        border: Border(bottom: BorderSide(color: _tabIndex == 1 ? const Color(0xFF00A896) : Colors.transparent, width: 2)),
                      ),
                      child: Text(
                        'Cài đặt cảnh báo',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: _tabIndex == 1 ? FontWeight.w600 : FontWeight.w400,
                          color: _tabIndex == 1 ? const Color(0xFF00A896) : Colors.white54,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            
            // Tab Content
            if (_tabIndex == 0) ...[
              _buildTextField('TÊN BỂ CÁ', _nameCtrl, hint: 'VD: Bể Rồng Phòng Khách'),
              _buildTextField('THỂ TÍCH (LÍT)', _volumeCtrl, type: TextInputType.number, hint: 'VD: 250'),
              Builder(builder: (_) {
                // Validate _speciesId exists in the list to prevent DropdownButton crash
                final speciesIds = widget.fishSpeciesList.map((s) => s['id'] as int).toList();
                final safeSpeciesId = (_speciesId != null && speciesIds.contains(_speciesId)) ? _speciesId : null;
                return _buildDropdown<int>(
                  'LOÀI CÁ',
                  safeSpeciesId,
                  [
                    const DropdownMenuItem(value: null, child: Text('Không xác định')),
                    ...widget.fishSpeciesList.map((s) => DropdownMenuItem(
                      value: s['id'] as int,
                      child: Text(s['species_name'] as String),
                    )),
                  ],
                  (val) => setState(() => _speciesId = val),
                );
              }),
              _buildTextField('MÃ THIẾT BỊ (MAC)', _macCtrl, hint: 'AA:BB:CC:DD:EE:FF'),
            ] else ...[
              Text('KÊNH NHẬN THÔNG BÁO', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white70)),
              const SizedBox(height: 8),
              _buildSwitch('Thông báo qua Email', _email, (v) => setState(() => _email = v)),
              _buildSwitch('Thông báo qua trình duyệt web', _web, (v) => setState(() => _web = v)),
              _buildSwitch('Thông báo trên App', _app, (v) => setState(() => _app = v)),
              const SizedBox(height: 16),
              _buildDropdown<int>(
                'THỜI GIAN NHẮC LẠI (COOLDOWN)',
                _cooldown,
                const [
                  DropdownMenuItem(value: 0, child: Text('Không nhắc lại')),
                  DropdownMenuItem(value: 1, child: Text('Nhắc nhở liên tục (1 phút)')),
                  DropdownMenuItem(value: 15, child: Text('Nhắc lại sau 15 phút')),
                  DropdownMenuItem(value: 30, child: Text('Nhắc lại sau 30 phút')),
                  DropdownMenuItem(value: 60, child: Text('Nhắc lại sau 1 giờ')),
                ],
                (val) => setState(() => _cooldown = val!),
              ),
              _buildDropdown<String>(
                'BỘ LỌC MỨC ĐỘ',
                _severity,
                const [
                  DropdownMenuItem(value: 'both', child: Text('Nhận tất cả cảnh báo')),
                  DropdownMenuItem(value: 'critical_only', child: Text('Chỉ nhận cảnh báo Nguy hiểm')),
                  DropdownMenuItem(value: 'warning_only', child: Text('Chỉ nhận cảnh báo Cảnh báo')),
                  DropdownMenuItem(value: 'none', child: Text('Tắt thông báo')),
                ],
                (val) => setState(() => _severity = val!),
              ),
            ],

            if (_errorMsg.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Text(_errorMsg, style: GoogleFonts.inter(color: Colors.redAccent, fontSize: 13)),
              ),
              
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text('Hủy', style: GoogleFonts.inter(color: Colors.white70, fontSize: 14)),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _isLoading ? null : _saveSettings,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00A896),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: _isLoading
                      ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : Text('Lưu thay đổi', style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}
