import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../customer_theme.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fl_chart/fl_chart.dart';
import 'login_screen.dart';
import '../services/supabase_service.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'alerts_screen.dart';
import '../widgets/alerts_pie_chart.dart';
import 'control_screen.dart';
import '../widgets/sensor_history_drill_down.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:ui' as ui;

import '../services/fcm_service.dart';
import 'dart:math' as math;
import 'dart:convert';
import 'package:image_picker/image_picker.dart';

// All symbols used by the customer overview are vector SVGs, not font icons.
class _AquaSvg extends StatelessWidget {
  final String name;
  final double size;
  final Color color;

  const _AquaSvg(this.name, {required this.size, required this.color});

  static const _paths = <String, String>{
    'home':
        '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    'chart': '<path d="M3 19h18M4 15l5-5 4 3 7-8"/><path d="M17 5h3v3"/>',
    'controls':
        '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="#000" stroke="none"/><circle cx="16" cy="12" r="2" fill="#000" stroke="none"/><circle cx="8" cy="18" r="2" fill="#000" stroke="none"/>',
    'check': '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
    'bell':
        '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/>',
    'sun':
        '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    'moon': '<path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/>',
    'logout':
        '<path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 16l4-4-4-4M8 12h10"/>',
    'plus': '<path d="M12 5v14M5 12h14"/>',
    'chevronDown': '<path d="m6 9 6 6 6-6"/>',
    'arrowRight': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    'drop':
        '<path d="M12 2c-3.2 4.3-7 8.4-7 12a7 7 0 0 0 14 0c0-3.6-3.8-7.7-7-12Z"/>',
    'thermometer':
        '<path d="M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0Z"/><path d="M12 10v7"/>',
    'tds':
        '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="17" r="2"/><circle cx="19" cy="17" r="2"/><path d="m11 7-5 8m7-8 5 8M7 17h10"/>',
    'waves':
        '<path d="M2 8c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2M2 14c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2"/>',
    'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'settings':
        '<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9 7 7m10 10 2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>',
    'trash': '<path d="M4 7h16M9 7V4h6v3m-9 0 1 14h10l1-14M10 11v6m4-6v6"/>',
    'alert': '<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5m0 3h.01"/>',
  };

  @override
  Widget build(BuildContext context) => SvgPicture.string(
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${_paths[name] ?? _paths['check']}</svg>',
    width: size,
    height: size,
    colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
    semanticsLabel: name,
  );
}

String _sensorSvgName(String name) => switch (name) {
  'pH' => 'drop',
  'Nhiệt độ' => 'thermometer',
  'TDS' => 'tds',
  _ => 'waves',
};

// ─────────────────── POND MODEL ─────────────────────────────
class Pond {
  String id;
  String name;
  String? volume;
  int? speciesId;
  String? macAddress;
  String? lastCalibPh;

  Pond({
    required this.id,
    required this.name,
    this.volume,
    this.speciesId,
    this.macAddress,
    this.lastCalibPh,
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
  final bool hasData;

  const SensorData({
    required this.name,
    required this.unit,
    required this.value,
    required this.color,
    required this.icon,
    required this.status,
    required this.history,
    this.hasData = true,
  });
}

String sensorStatus(String name, double? value) {
  if (value == null || !value.isFinite) return 'Chưa có dữ liệu';
  if (name == 'Mực nước') return value == 1 ? 'Ổn định' : 'Cạn nước';
  final bounds = switch (name) {
    'pH' => [6.5, 7.5, 6.0, 8.0],
    'Nhiệt độ' => [24.0, 28.0, 22.0, 30.0],
    'TDS' => [150.0, 300.0, 100.0, 400.0],
    _ => null,
  };
  if (bounds == null) return 'Chưa có dữ liệu';
  if (value >= bounds[0] && value <= bounds[1]) return 'Tốt';
  if (value >= bounds[2] && value <= bounds[3]) return 'Cảnh báo';
  return 'Nguy hiểm';
}

Color sensorStatusColor(String status) => switch (status) {
  'Tốt' || 'Ổn định' => CustomerColors.accentText,
  'Cảnh báo' =>
    CustomerColors.dark ? const Color(0xFFFFB347) : const Color(0xFF995300),
  'Nguy hiểm' || 'Cạn nước' =>
    CustomerColors.dark ? const Color(0xFFFF6B6B) : const Color(0xFFB42318),
  _ => CustomerColors.mutedText,
};

/// Supabase sends the newest reading first. Missing readings stay unknown.
List<SensorData> sensorsFromTelemetry(List<Map<String, dynamic>> logs) {
  const configs = [
    (
      name: 'pH',
      field: 'ph',
      unit: '',
      color: Color(0xFF00A896),
      icon: Icons.science_outlined,
    ),
    (
      name: 'Nhiệt độ',
      field: 'temp',
      unit: '°C',
      color: Color(0xFFFF8C42),
      icon: Icons.thermostat_outlined,
    ),
    (
      name: 'TDS',
      field: 'tds',
      unit: 'ppm',
      color: Color(0xFFC77DFF),
      icon: Icons.water_drop_outlined,
    ),
    (
      name: 'Mực nước',
      field: 'water_level_ok',
      unit: '',
      color: Color(0xFF4DA6FF),
      icon: Icons.waves_outlined,
    ),
  ];
  return configs.map((config) {
    double? reading(Map<String, dynamic> log) {
      final raw = log[config.field];
      if (config.field == 'water_level_ok') {
        return raw is bool ? (raw ? 1.0 : 0.0) : null;
      }
      final value = raw is num ? raw.toDouble() : null;
      return value != null && value.isFinite ? value : null;
    }

    final latest = logs.isEmpty ? null : reading(logs.first);
    return SensorData(
      name: config.name,
      unit: config.unit,
      value: latest ?? 0,
      color: config.color,
      icon: config.icon,
      status: sensorStatus(config.name, latest),
      history: logs.reversed.map(reading).whereType<double>().toList(),
      hasData: latest != null,
    );
  }).toList();
}

// ─────────────── MOCK SENSOR DATA ───────────────────────────
final List<SensorData> sensorList = [
  SensorData(
    name: 'pH',
    unit: '',
    value: 7.20,
    color: Color(0xFF00A896),
    icon: Icons.science_outlined,
    status: 'Tốt',
    history: [7.1, 7.0, 7.2, 7.3, 7.15, 7.25, 7.20, 7.18, 7.22, 7.20],
  ),
  SensorData(
    name: 'Nhiệt độ',
    unit: '°C',
    value: 26.50,
    color: Color(0xFFFF8C42),
    icon: Icons.thermostat_outlined,
    status: 'Tốt',
    history: [26.0, 26.3, 26.8, 27.0, 26.6, 26.4, 26.5, 26.7, 26.5, 26.5],
  ),
  SensorData(
    name: 'TDS',
    unit: 'ppm',
    value: 245.00,
    color: Color(0xFFC77DFF),
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
    color: Color(0xFF4DA6FF),
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
    color: Color(0xFF00A896),
    icon: Icons.check_circle_outline,
    isWarning: false,
  ),
  AlertItem(
    title: 'Nhiệt độ bình thường',
    message: 'Nhiệt độ nước ổn định 26.5°C',
    time: '5 phút trước',
    color: Color(0xFF00A896),
    icon: Icons.check_circle_outline,
    isWarning: false,
  ),
  AlertItem(
    title: 'Mực nước thấp',
    message: 'Cảnh báo cạn nước, vui lòng kiểm tra van cấp và châm thêm nước',
    time: '12 phút trước',
    color: Color(0xFFFF6B6B),
    icon: Icons.warning_amber_outlined,
    isWarning: true,
  ),
  AlertItem(
    title: 'TDS tăng',
    message: 'Nồng độ TDS tăng lên 245 ppm, cân nhắc thay 20% nước',
    time: '30 phút trước',
    color: Color(0xFFFF8C42),
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
  static const _onboardingPreferenceKey = 'hide_onboarding_v2';

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
    _currentSensors = sensorsFromTelemetry([]);
    if (_activePondId.isNotEmpty) {
      _telemetryStream = SupabaseService.instance.getTelemetryStream(
        _activePondId,
      );
      _alertsStream = SupabaseService.instance.getAlertsStream(_activePondId);
    } else {
      _telemetryStream = null;
      _alertsStream = null;
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

  List<SensorData> _currentSensors = sensorsFromTelemetry([]);

  final List<String> _tabTitles = [
    'Tổng quan',
    'Cảm biến',
    'Điều khiển',
    // Tạm ẩn hiệu chuẩn pH cho đến khi hoàn thiện phần cứng.
    // 'Hiệu chuẩn',
    'Cảnh báo',
  ];

  @override
  void initState() {
    super.initState();
    debugPrint('🚀 DashboardScreen đã khởi tạo');
    _updateTime();
    _clockTimer = Timer.periodic(Duration(seconds: 30), (_) => _updateTime());

    _pulseController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 0.4, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _pulseTimer = Timer.periodic(Duration(milliseconds: 600), (_) {
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
      final storedName =
          (parsedInfo['full_name'] ?? parsedInfo['name'] ?? '') as String;
      final authUser = Supabase.instance.client.auth.currentUser;

      if (storedName.trim().isEmpty) {
        final metaName =
            authUser?.userMetadata?['full_name'] ??
            authUser?.userMetadata?['name'] ??
            '';
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
      if (parsedInfo['avatar_url'] == null ||
          parsedInfo['avatar_url'].toString().isEmpty) {
        final metaAvatar =
            authUser?.userMetadata?['avatar_url'] ??
            authUser?.userMetadata?['picture'];
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
      final fileName =
          '${_userInfo!['id']}_${DateTime.now().millisecondsSinceEpoch}.$fileExt';

      await Supabase.instance.client.storage
          .from('avatars')
          .uploadBinary(
            fileName,
            bytes,
            fileOptions: FileOptions(upsert: true),
          );

      final publicUrl = Supabase.instance.client.storage
          .from('avatars')
          .getPublicUrl(fileName);

      try {
        await Supabase.instance.client.auth.updateUser(
          UserAttributes(data: {'avatar_url': publicUrl}),
        );
      } catch (e) {
        debugPrint('Auth session missing, ignoring update user metadata');
      }

      try {
        await Supabase.instance.client
            .from('users')
            .update({'avatar_url': publicUrl})
            .eq('id', _userInfo!['id']);
      } catch (e) {
        debugPrint('RLS blocked public.users update');
      }

      _userInfo!['avatar_url'] = publicUrl;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_info', jsonEncode(_userInfo));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Cập nhật ảnh đại diện thành công')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi tải ảnh lên: $e')));
      }
    } finally {
      if (mounted) setState(() => _isUploadingAvatar = false);
    }
  }

  Future<void> _loadOnboardingPref() async {
    final prefs = await SharedPreferences.getInstance();
    if (mounted) {
      setState(() {
        _hideOnboarding = prefs.getBool(_onboardingPreferenceKey) ?? false;
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
        await Future.delayed(Duration(milliseconds: 500));
        user = Supabase.instance.client.auth.currentUser;
        retries++;
      }

      if (user == null) {
        throw StateError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      final currentUserId = user.id;

      debugPrint('--- DEBUG: _loadPonds started for user: $currentUserId ---');
      final data = await SupabaseService.instance.getTanks(currentUserId);
      debugPrint('--- DEBUG: Received data from getTanks: $data ---');
      if (mounted) {
        setState(() {
          _ponds = data.map((json) {
            String? mac;
            String? lastCalib;
            var devicesData = json['devices'];
            if (devicesData != null) {
              if (devicesData is List && devicesData.isNotEmpty) {
                mac = devicesData[0]['mac_address'];
                lastCalib = devicesData[0]['last_calib_ph'];
              } else if (devicesData is Map) {
                mac = devicesData['mac_address'];
                lastCalib = devicesData['last_calib_ph'];
              }
            }
            return Pond(
              id: json['id'].toString(),
              name: json['tank_name'],
              volume: json['water_volume_liter']?.toString(),
              speciesId: json['species_id'],
              macAddress: mac,
              lastCalibPh: lastCalib,
            );
          }).toList();
          if (!_ponds.any((pond) => pond.id == _activePondId)) {
            _activePondId = _ponds.isEmpty ? '' : _ponds.first.id;
          }
          _updateStream();
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Không tải được danh sách bể: $e')),
        );
      }
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
    Future.delayed(Duration(milliseconds: 600), () {
      if (mounted) setState(() => _isLoading = false);
    });
  }

  // ─────────────── POND CRUD ───────────────────────────────

  Future<void> _showAddPondDialog() async {
    final userId = Supabase.instance.client.auth.currentUser?.id;
    if (userId == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Vui lòng đăng nhập lại.')),
        );
      }
      return;
    }

    final created = await showCustomerDialog<Map<String, dynamic>>(
      context: context,
      barrierColor: Colors.black.withValues(alpha: 0.65),
      builder: (_) =>
          _AddPondDialog(userId: userId, fishSpeciesList: _fishSpecies),
    );
    if (!mounted || created == null) return;

    final newPond = Pond(
      id: created['id'].toString(),
      name: created['tank_name'] as String,
      volume: created['water_volume_liter']?.toString(),
      speciesId: created['species_id'] as int?,
      macAddress: created['mac_address'] as String?,
    );
    setState(() {
      _ponds.add(newPond);
      _activePondId = newPond.id;
      _updateStream();
    });
  }

  void _showPondSettingsDialog(Pond pond) {
    showCustomerDialog(
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
    var saving = false;
    var error = '';
    showCustomerDialog(
      context: context,
      barrierColor: Colors.black.withValues(alpha: 0.65),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, updateDialog) => AlertDialog(
          backgroundColor: CustomerColors.card,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
            side: BorderSide(color: CustomerColors.border),
          ),
          title: Text(
            '🗑️ Xóa bể cá',
            style: GoogleFonts.inter(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: CustomerColors.text,
            ),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              RichText(
                text: TextSpan(
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: CustomerColors.secondaryText,
                    height: 1.6,
                  ),
                  children: [
                    TextSpan(text: 'Bạn có chắc muốn xóa '),
                    TextSpan(
                      text: '"${pond.name}"',
                      style: TextStyle(
                        color: CustomerColors.text,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    TextSpan(text: '?\nHành động này không thể hoàn tác.'),
                  ],
                ),
              ),
              if (error.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text(
                    error,
                    style: const TextStyle(color: Color(0xFFFF6B6B)),
                  ),
                ),
            ],
          ),
          actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          actions: [
            TextButton(
              onPressed: saving ? null : () => Navigator.pop(ctx),
              style: TextButton.styleFrom(
                foregroundColor: CustomerColors.secondaryText,
                padding: const EdgeInsets.symmetric(
                  horizontal: 18,
                  vertical: 10,
                ),
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
              onPressed: saving
                  ? null
                  : () async {
                      final userId =
                          Supabase.instance.client.auth.currentUser?.id;
                      if (userId == null) {
                        updateDialog(() => error = 'Vui lòng đăng nhập lại.');
                        return;
                      }
                      updateDialog(() {
                        saving = true;
                        error = '';
                      });
                      try {
                        final cleaned = await SupabaseService.instance
                            .deleteTank(userId: userId, tankId: pond.id);
                        if (!mounted) return;
                        setState(() {
                          _ponds.removeWhere((item) => item.id == pond.id);
                          if (_activePondId == pond.id) {
                            _activePondId = _ponds.isEmpty
                                ? ''
                                : _ponds.first.id;
                            _updateStream();
                          }
                        });
                        if (ctx.mounted) {
                          Navigator.pop(ctx);
                        }
                        if (!cleaned && mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Đã xóa bể nhưng chưa cập nhật được thiết bị. Vui lòng kiểm tra lại.',
                              ),
                            ),
                          );
                        }
                      } catch (e) {
                        if (ctx.mounted) {
                          updateDialog(() => error = 'Không thể xóa bể: $e');
                        }
                      } finally {
                        if (ctx.mounted) {
                          updateDialog(() => saving = false);
                        }
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(0xFFFF6B6B),
                foregroundColor: CustomerColors.text,
                padding: const EdgeInsets.symmetric(
                  horizontal: 18,
                  vertical: 10,
                ),
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
      ),
    );
  }

  // ─────────────── LOGOUT ──────────────────────────────────
  void _handleLogout() {
    showCustomerDialog(
      context: context,
      barrierColor: Colors.black.withValues(alpha: 0.6),
      builder: (ctx) => AlertDialog(
        backgroundColor: CustomerColors.card,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: CustomerColors.text.withValues(alpha: 0.08),
            width: 1,
          ),
        ),
        title: Text(
          'Đăng xuất',
          style: GoogleFonts.inter(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: CustomerColors.text,
          ),
        ),
        content: Text(
          'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
          style: GoogleFonts.inter(
            fontSize: 13,
            color: CustomerColors.secondaryText,
            height: 1.5,
          ),
        ),
        actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            style: TextButton.styleFrom(
              foregroundColor: CustomerColors.secondaryText,
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
                  pageBuilder: (_, _, _) => LoginScreen(),
                  transitionsBuilder: (_, anim, _, child) =>
                      FadeTransition(opacity: anim, child: child),
                  transitionDuration: Duration(milliseconds: 350),
                ),
                (route) => false,
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Color(0xFFFF6B6B),
              foregroundColor: CustomerColors.text,
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
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: CustomerTheme.mode,
      builder: (context, mode, _) => Theme(
        data: CustomerTheme.data,
        child: AnnotatedRegion<SystemUiOverlayStyle>(
          value: SystemUiOverlayStyle(
            statusBarColor: Colors.transparent,
            statusBarIconBrightness: mode == ThemeMode.dark
                ? Brightness.light
                : Brightness.dark,
            systemNavigationBarColor: CustomerColors.background,
            systemNavigationBarIconBrightness: mode == ThemeMode.dark
                ? Brightness.light
                : Brightness.dark,
          ),
          child: Scaffold(
            backgroundColor: Colors.transparent,
            body: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  transform: GradientRotation(135 * pi / 180),
                  colors: [
                    CustomerColors.background,
                    CustomerColors.backgroundMid,
                    CustomerColors.backgroundEnd,
                  ],
                  stops: [0.0, 0.5, 1.0],
                ),
              ),
              child: SafeArea(
                bottom: false,
                child: Stack(
                  children: [
                    Column(
                      children: [
                        _buildTopBar(),
                        Expanded(
                          child: AnimatedOpacity(
                            opacity: _isLoading ? 0.35 : 1.0,
                            duration: Duration(milliseconds: 250),
                            child: _activePondId.isEmpty
                                ? _buildOnboardingSection()
                                : StreamBuilder<List<Map<String, dynamic>>>(
                                    key: ValueKey(_activePondId),
                                    stream: _telemetryStream,
                                    builder: (context, snapshot) {
                                      if (snapshot.connectionState ==
                                          ConnectionState.waiting) {
                                        if (_isLoading) {
                                          return const SizedBox.shrink();
                                        }
                                        return Center(
                                          child: CircularProgressIndicator(
                                            color: Color(0xFF00A896),
                                          ),
                                        );
                                      }

                                      _currentSensors = sensorsFromTelemetry(
                                        snapshot.hasError
                                            ? []
                                            : (snapshot.data ?? []),
                                      );

                                      return _buildTabContent();
                                    },
                                  ),
                          ),
                        ),
                      ],
                    ),
                    Positioned(
                      left: 0,
                      right: 0,
                      bottom: 0,
                      child: _buildBottomNav(),
                    ),
                    // Loading overlay
                    if (_isLoading)
                      Positioned.fill(
                        child: Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              SizedBox(
                                width: 28,
                                height: 28,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    Color(0xFF00A896),
                                  ),
                                ),
                              ),
                              SizedBox(height: 10),
                              Text(
                                'Đang đồng bộ dữ liệu...',
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  color: CustomerColors.text.withValues(
                                    alpha: 0.5,
                                  ),
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
          ),
        ),
      ),
    );
  }

  Widget _buildFeatureRow(String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.only(top: 2),
            child: _AquaSvg('controls', size: 12, color: Color(0xFF00A896)),
          ),
          SizedBox(width: 8),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: CustomerColors.secondaryText,
                  height: 1.5,
                ),
                children: [
                  TextSpan(
                    text: '$title ',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      color: CustomerColors.text,
                    ),
                  ),
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
    final headingColor = isOverlay ? Colors.white : CustomerColors.text;
    final descriptionColor = isOverlay
        ? const Color(0xFFD7E1EA)
        : CustomerColors.secondaryText;

    Widget content = Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          'Chào mừng đến với AquaCare!',
          style: GoogleFonts.inter(
            fontSize: 26,
            fontWeight: FontWeight.w900,
            color: headingColor,
            letterSpacing: -0.5,
          ),
          textAlign: TextAlign.center,
        ),
        SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Text(
            'Hệ thống giám sát và điều khiển hồ cá thông minh. Hãy cùng tìm hiểu nhanh các chức năng chính để bắt đầu.',
            style: GoogleFonts.inter(
              fontSize: 14,
              color: descriptionColor,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
        ),
        SizedBox(height: 32),
        // Card 1
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 24),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: CustomerColors.card,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Color(0xFF00A896).withValues(alpha: 0.3)),
            boxShadow: isOverlay
                ? [
                    BoxShadow(
                      color: Colors.black54,
                      blurRadius: 24,
                      offset: Offset(0, 8),
                    ),
                  ]
                : [],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF00A896), Color(0xFF028090)],
                      ),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '1',
                      style: GoogleFonts.inter(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: CustomerColors.text,
                      ),
                    ),
                  ),
                  SizedBox(width: 12),
                  Text(
                    'Khám phá tính năng',
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: CustomerColors.text,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 16),
              _buildFeatureRow('Tổng quan:', 'Theo dõi trạng thái chung.'),
              _buildFeatureRow('Cảm biến:', 'Phân tích biểu đồ dữ liệu.'),
              _buildFeatureRow('Điều khiển:', 'Điều khiển thiết bị từ xa.'),
              _buildFeatureRow('Cảnh báo:', 'Quản lý thông báo quan trọng.'),
            ],
          ),
        ),
        SizedBox(height: 20),
        // Card 2
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 24),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: CustomerColors.card,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Color(0xFF4DA6FF).withValues(alpha: 0.3)),
            boxShadow: isOverlay
                ? [
                    BoxShadow(
                      color: Colors.black54,
                      blurRadius: 24,
                      offset: Offset(0, 8),
                    ),
                  ]
                : [],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF4DA6FF), Color(0xFF0066CC)],
                      ),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '2',
                      style: GoogleFonts.inter(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: CustomerColors.text,
                      ),
                    ),
                  ),
                  SizedBox(width: 12),
                  Text(
                    'Bắt đầu sử dụng',
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: CustomerColors.text,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 12),
              Text(
                'Để trải nghiệm đầy đủ các tính năng, hãy tạo bể cá đầu tiên của bạn.',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: CustomerColors.secondaryText,
                  height: 1.5,
                ),
              ),
              if (!isOverlay) ...[
                SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _showAddPondDialog,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Color(0xFF00A896),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(
                      '+ Thêm bể cá mới',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: CustomerColors.text,
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),

        if (isOverlay) ...[
          SizedBox(height: 32),
          GestureDetector(
            onTap: () async {
              final prefs = await SharedPreferences.getInstance();
              await prefs.setBool(_onboardingPreferenceKey, true);
              setState(() {
                _hideOnboarding = true;
              });
            },
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: isOverlay
                          ? Colors.white.withValues(alpha: 0.72)
                          : CustomerColors.mutedText,
                    ),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                SizedBox(width: 10),
                Text(
                  'Không hiển thị lại',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: headingColor,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );

    if (!isOverlay) {
      return Center(
        child: SingleChildScrollView(
          physics: BouncingScrollPhysics(),
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
            top: 8,
            left: 0,
            right: 0,
            height: 60,
            child: Align(
              alignment: const Alignment(-0.32, 0),
              child: SizedBox(
                width: 88,
                height: 60,
                child: CustomPaint(
                  painter: ArrowPainter(
                    color: Color(0xFF4DA6FF),
                    pointUp: true,
                  ),
                ),
              ),
            ),
          ),
          // Arrow down (to Bottom Tabs)
          Positioned(
            bottom: 68,
            left: 0,
            right: 0,
            height: 58,
            child: Align(
              alignment: const Alignment(-0.58, 0),
              child: SizedBox(
                width: 72,
                height: 58,
                child: CustomPaint(
                  painter: ArrowPainter(
                    color: Color(0xFF00A896),
                    pointUp: false,
                  ),
                ),
              ),
            ),
          ),
          Center(
            child: SingleChildScrollView(
              physics: BouncingScrollPhysics(),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(0, 40, 0, 110),
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
      padding: const EdgeInsets.fromLTRB(18, 16, 16, 12),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: CustomerColors.text.withValues(alpha: 0.05),
            width: 1,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Logo AquaCare (thế chỗ avatar cũ)
              Image.asset(
                'assets/images/logo.png',
                height: 34,
                fit: BoxFit.contain,
              ),
              const SizedBox(width: 10),

              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _tabTitles[_selectedTab],
                      style: GoogleFonts.inter(
                        fontSize: _selectedTab == 0 ? 20 : 18,
                        fontWeight: FontWeight.w800,
                        color: CustomerColors.text,
                        letterSpacing: -0.4,
                      ),
                    ),
                    Text(
                      _selectedTab == 0
                          ? 'Theo dõi bể cá của bạn'
                          : 'Cập nhật lúc $_currentTime',
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        color: CustomerColors.secondaryText,
                      ),
                    ),
                  ],
                ),
              ),

              // Live + Theme + Logout + Avatar
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AnimatedBuilder(
                    animation: _pulseAnimation,
                    builder: (context, child) => Container(
                      width: 7,
                      height: 7,
                      decoration: BoxDecoration(
                        color:
                            (_isLoading
                                    ? CustomerColors.waterText
                                    : CustomerColors.accentText)
                                .withValues(alpha: _pulseAnimation.value),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color:
                                (_isLoading
                                        ? CustomerColors.waterText
                                        : CustomerColors.accentText)
                                    .withValues(
                                      alpha: _pulseAnimation.value * 0.6,
                                    ),
                            blurRadius: 5,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    _isLoading
                        ? 'Sync'
                        : _currentSensors.every((sensor) => sensor.hasData)
                        ? 'Live'
                        : 'Chờ dữ liệu',
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: _isLoading
                          ? CustomerColors.waterText
                          : CustomerColors.accentText,
                      letterSpacing: 0.4,
                    ),
                  ),
                  const SizedBox(width: 4),
                  IconButton(
                    onPressed: () => CustomerTheme.toggle(),
                    icon: _AquaSvg(
                      CustomerColors.dark ? 'sun' : 'moon',
                      size: 19,
                      color: CustomerColors.secondaryText,
                    ),
                    tooltip: CustomerColors.dark
                        ? 'Chuyển sang giao diện sáng'
                        : 'Chuyển sang giao diện tối',
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(
                      minWidth: 28,
                      minHeight: 28,
                    ),
                  ),
                  IconButton(
                    onPressed: _handleLogout,
                    icon: _AquaSvg(
                      'logout',
                      size: 19,
                      color: CustomerColors.secondaryText,
                    ),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(
                      minWidth: 28,
                      minHeight: 28,
                    ),
                    tooltip: 'Đăng xuất',
                    splashRadius: 18,
                  ),
                  const SizedBox(width: 6),
                  // Avatar người dùng (nằm bên phải nút logout)
                  GestureDetector(
                    onTap: _pickAndUploadAvatar,
                    child: Stack(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: CustomerColors.accentText.withValues(
                                alpha: 0.5,
                              ),
                              width: 1.5,
                            ),
                            gradient: _userInfo?['avatar_url'] != null
                                ? null
                                : const LinearGradient(
                                    colors: [
                                      Color(0xFF1B4F72),
                                      Color(0xFF00A896),
                                    ],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                            image: _userInfo?['avatar_url'] != null
                                ? DecorationImage(
                                    image: NetworkImage(
                                      _userInfo!['avatar_url'],
                                    ),
                                    fit: BoxFit.cover,
                                  )
                                : null,
                          ),
                          child: _userInfo?['avatar_url'] == null
                              ? Center(
                                  child: Text(
                                    getInitialsAvatar(
                                      _userInfo?['full_name'] ??
                                          _userInfo?['name'],
                                    ),
                                    style: GoogleFonts.inter(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: CustomerColors.text,
                                    ),
                                  ),
                                )
                              : null,
                        ),
                        if (_isUploadingAvatar)
                          Positioned.fill(
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.black54,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Center(
                                child: SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(
                                    color: CustomerColors.text,
                                    strokeWidth: 2,
                                  ),
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),

          SizedBox(height: 16),

          // ── Pond Selector Row ──────────────────────────────
          Row(
            children: [
              Expanded(child: _buildPondSelector()),
              SizedBox(width: 8),
              // Add pond button
              GestureDetector(
                onTap: _showAddPondDialog,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: CustomerColors.border,
                      style: BorderStyle.solid,
                    ),
                    color: CustomerColors.card,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _AquaSvg(
                        'plus',
                        size: 13,
                        color: CustomerColors.accentText,
                      ),
                      SizedBox(width: 4),
                      Text(
                        'Thêm bể',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: CustomerColors.accentText,
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
      color: CustomerColors.card,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: CustomerColors.text.withValues(alpha: 0.08)),
      ),
      elevation: 10,
      offset: Offset(0, 8),
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
              onDelete: () {
                Navigator.pop(ctx);
                _showDeletePondDialog(pond);
              },
            ),
          ),
        ),
        // Divider
        PopupMenuDivider(height: 1),
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
                  color: Color(0xFF00A896).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: _AquaSvg(
                  'plus',
                  size: 16,
                  color: CustomerColors.accentText,
                ),
              ),
              SizedBox(width: 10),
              Text(
                'Thêm bể mới',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: CustomerColors.accentText,
                ),
              ),
            ],
          ),
        ),
      ],
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: CustomerColors.card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: CustomerColors.border),
        ),
        child: Row(
          children: [
            _AquaSvg('drop', size: 13, color: CustomerColors.accentText),
            SizedBox(width: 7),
            Expanded(
              child: Text(
                _activePond.name,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: CustomerColors.text,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            SizedBox(width: 4),
            _AquaSvg('chevronDown', size: 16, color: CustomerColors.mutedText),
          ],
        ),
      ),
    );
  }

  // ─────────────── BOTTOM NAV BAR ─────────────────────────
  Widget _buildBottomNav() {
    final items = [
      {'icon': 'home', 'label': 'Tổng quan'},
      {'icon': 'chart', 'label': 'Cảm biến'},
      {'icon': 'controls', 'label': 'Điều khiển'},
      // {'icon': 'check', 'label': 'Hiệu chuẩn'},
      {'icon': 'bell', 'label': 'Cảnh báo'},
    ];

    return SafeArea(
      top: false,
      child: Container(
        margin: const EdgeInsets.only(left: 32, right: 32, bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 5),
        decoration: BoxDecoration(
          color: CustomerColors.card,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: CustomerColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(
                alpha: CustomerColors.dark ? 0.4 : 0.08,
              ),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: List.generate(items.length, (i) {
            final isSelected = _selectedTab == i;
            return Expanded(
              child: Semantics(
                button: true,
                selected: isSelected,
                label: items[i]['label']!,
                child: InkWell(
                  onTap: () {
                    setState(() => _selectedTab = i);
                    // Reset badge khi bấm vào tab Cảnh báo
                    if (i == 3) {
                      setState(() => _unreadAlertCount = 0);
                    }
                  },
                  borderRadius: BorderRadius.circular(24),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    curve: Curves.easeOut,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? CustomerColors.accentText.withValues(alpha: 0.14)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Stack(
                          clipBehavior: Clip.none,
                          children: [
                            _AquaSvg(
                              items[i]['icon']!,
                              size: 22,
                              color: isSelected
                                  ? CustomerColors.accentText
                                  : CustomerColors.mutedText,
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
                                    color: Color(0xFFFF6B6B),
                                    borderRadius: BorderRadius.circular(8),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Color(
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
                                      color: CustomerColors.text,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }),
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
        // _buildCalibrationTab(), // Tạm ẩn; giữ nguyên mã bên dưới để dùng lại.
        _buildAlertsTab(),
      ],
    );
  }

  // ══════════════════════════════════════════════════════════
  //                    TAB: TỔNG QUAN
  // ══════════════════════════════════════════════════════════
  Widget _buildOverviewTab() {
    return CustomScrollView(
      physics: BouncingScrollPhysics(),
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: _buildSummaryBanner(),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 14),
            child: Row(
              children: [
                Text(
                  'Chỉ số môi trường',
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: CustomerColors.text,
                  ),
                ),
                Spacer(),
                GestureDetector(
                  onTap: () => setState(() => _selectedTab = 1),
                  child: Row(
                    children: [
                      Text(
                        'Chi tiết',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: CustomerColors.accentText,
                        ),
                      ),
                      SizedBox(width: 4),
                      _AquaSvg(
                        'arrowRight',
                        size: 14,
                        color: CustomerColors.accentText,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          sliver: SliverGrid(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 0.92,
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
              padding: const EdgeInsets.fromLTRB(16, 22, 16, 0),
              child: _buildRecentActivityCard(),
            ),
          ),
        if (_alertsStream != null)
          SliverToBoxAdapter(
            child: AlertsPieChart(
              tankId: _activePondId,
              alertsStream: _alertsStream!,
            ),
          ),
        SliverToBoxAdapter(
          child: SizedBox(height: 96 + MediaQuery.paddingOf(context).bottom),
        ),
      ],
    );
  }

  Widget _buildSummaryBanner() {
    final hasData = _currentSensors.every((sensor) => sensor.hasData);
    final healthy =
        hasData &&
        _currentSensors.every(
          (sensor) => sensor.status == 'Tốt' || sensor.status == 'Ổn định',
        );
    return ClipRRect(
      borderRadius: BorderRadius.circular(22),
      child: SizedBox(
        height: 216,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              'assets/images/overview_aquarium.png',
              fit: BoxFit.cover,
            ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withValues(alpha: 0.08),
                    Colors.black.withValues(alpha: 0.84),
                  ],
                  stops: [0.25, 1],
                ),
              ),
            ),
            Positioned(
              top: 16,
              left: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.55),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: BoxDecoration(
                        color: Color(0xFF42C99C),
                        shape: BoxShape.circle,
                      ),
                    ),
                    SizedBox(width: 6),
                    Text(
                      _isLoading
                          ? 'Đang đồng bộ'
                          : hasData
                          ? 'Trực tuyến'
                          : 'Chưa có dữ liệu',
                      style: GoogleFonts.inter(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Positioned(
              left: 18,
              right: 18,
              bottom: 18,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: healthy ? Color(0xFF279F80) : Color(0xFF2E87B0),
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: _AquaSvg(
                      !hasData
                          ? 'clock'
                          : healthy
                          ? 'check'
                          : 'alert',
                      size: 25,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          !hasData
                              ? 'Đang chờ dữ liệu'
                              : healthy
                              ? 'Bể đang ổn định'
                              : 'Bể cần chú ý',
                          style: GoogleFonts.inter(
                            color: Colors.white,
                            fontSize: 21,
                            fontWeight: FontWeight.w800,
                            height: 1.1,
                          ),
                        ),
                        SizedBox(height: 5),
                        Text(
                          !hasData
                              ? 'Chưa có đủ dữ liệu cảm biến'
                              : healthy
                              ? 'Các cảm biến đang hoạt động bình thường'
                              : 'Hãy kiểm tra chỉ số và cảnh báo',
                          style: GoogleFonts.inter(
                            color: Color(0xFFE1E9ED),
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentActivityCard() {
    final hasNewAlerts = _unreadAlertCount > 0;
    return InkWell(
      onTap: () => setState(() {
        _selectedTab = 3;
        _unreadAlertCount = 0;
      }),
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: CustomerColors.card,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: CustomerColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _AquaSvg('bell', size: 19, color: CustomerColors.accentText),
                SizedBox(width: 9),
                Expanded(
                  child: Text(
                    'Diễn biến gần đây',
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: CustomerColors.text,
                    ),
                  ),
                ),
                Text(
                  'Xem tất cả',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: CustomerColors.accentText,
                  ),
                ),
                SizedBox(width: 4),
                _AquaSvg(
                  'arrowRight',
                  size: 14,
                  color: CustomerColors.accentText,
                ),
              ],
            ),
            SizedBox(height: 15),
            Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color:
                        (hasNewAlerts ? Color(0xFF2E87B0) : Color(0xFF279F80))
                            .withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: _AquaSvg(
                    hasNewAlerts ? 'alert' : 'check',
                    size: 18,
                    color: hasNewAlerts
                        ? CustomerColors.waterText
                        : CustomerColors.accentText,
                  ),
                ),
                SizedBox(width: 11),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        hasNewAlerts
                            ? 'Có $_unreadAlertCount cảnh báo mới'
                            : 'Chưa có cảnh báo mới',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: CustomerColors.text,
                        ),
                      ),
                      SizedBox(height: 3),
                      Text(
                        hasNewAlerts
                            ? 'Chạm để xem chi tiết cảnh báo'
                            : 'Mọi thay đổi quan trọng sẽ hiện ở đây',
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          color: CustomerColors.secondaryText,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  //                   TAB: CẢM BIẾN
  // ══════════════════════════════════════════════════════════
  Widget _buildSensorsTab() {
    if (_currentSensors.isEmpty) return SizedBox();

    return CustomScrollView(
      physics: BouncingScrollPhysics(),
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
                        color: isSelected
                            ? s.color.withValues(alpha: 0.15)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected
                              ? s.color
                              : CustomerColors.text.withValues(alpha: 0.1),
                          width: 1,
                        ),
                      ),
                      alignment: Alignment.center,
                      child: Row(
                        children: [
                          _AquaSvg(
                            _sensorSvgName(s.name),
                            size: 16,
                            color: isSelected
                                ? s.color
                                : CustomerColors.mutedText,
                          ),
                          SizedBox(width: 6),
                          Text(
                            s.name,
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.w500,
                              color: isSelected
                                  ? s.color
                                  : CustomerColors.mutedText,
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
            child: SensorDetailCard(
              sensor: _currentSensors[_selectedSensorIndex],
            ),
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
        SliverToBoxAdapter(
          child: SizedBox(height: 96 + MediaQuery.paddingOf(context).bottom),
        ),
      ],
    );
  }

  // ══════════════════════════════════════════════════════════
  //                   TAB: HIỆU CHUẨN
  // ══════════════════════════════════════════════════════════
  // Giữ nguyên phần triển khai để bật lại khi phần cứng hiệu chuẩn sẵn sàng.
  // ignore: unused_element
  Widget _buildCalibrationTab() {
    bool isCalibNeeded = true;
    if (_activePond.lastCalibPh != null) {
      final lastCalib = DateTime.parse(_activePond.lastCalibPh!);
      final sixMonthsAgo = DateTime.now().subtract(Duration(days: 180));
      isCalibNeeded = lastCalib.isBefore(sixMonthsAgo);
    }

    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(
        16,
        16,
        16,
        96 + MediaQuery.paddingOf(context).bottom,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Banner Cảnh báo
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isCalibNeeded
                  ? Color(0xFFFFB347).withValues(alpha: 0.1)
                  : Color(0xFF00A896).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isCalibNeeded ? Color(0xFFFFB347) : Color(0xFF00A896),
              ),
            ),
            child: Row(
              children: [
                _AquaSvg(
                  isCalibNeeded ? 'alert' : 'check',
                  color: isCalibNeeded ? Color(0xFFFFB347) : Color(0xFF00A896),
                  size: 28,
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isCalibNeeded
                            ? 'Đã đến lúc cần hiệu chuẩn cảm biến pH!'
                            : 'Cảm biến pH đang hoạt động tốt',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: isCalibNeeded
                              ? Color(0xFFFFB347)
                              : CustomerColors.accentText,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Lần hiệu chuẩn gần nhất: ${_activePond.lastCalibPh != null ? DateTime.parse(_activePond.lastCalibPh!).toLocal().toString().split(' ')[0] : 'Chưa từng hiệu chuẩn'}',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: CustomerColors.secondaryText,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 12),
          Text(
            'Lưu ý: Bạn có thể thực hiện hiệu chuẩn bất cứ lúc nào.',
            style: GoogleFonts.inter(
              fontSize: 12,
              color: CustomerColors.mutedText,
              fontStyle: FontStyle.italic,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 24),

          // Hướng dẫn
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: CustomerColors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: CustomerColors.text.withValues(alpha: 0.05),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hướng dẫn các bước:',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: CustomerColors.text,
                  ),
                ),
                SizedBox(height: 12),
                _buildInstructionStep(
                  '1',
                  'Nhấn nút Bắt đầu hiệu chuẩn để thiết bị vào chế độ hiệu chuẩn.',
                ),
                _buildInstructionStep(
                  '2',
                  'Lấy cảm biến pH ra khỏi hồ, rửa sạch bằng nước cất và lau khô bằng giấy mềm.',
                ),
                _buildInstructionStep(
                  '3',
                  'Nhúng cảm biến vào dung dịch chuẩn pH 7.0, đợi giá trị ổn định rồi nhấn nút Calib 7.0.',
                ),
                _buildInstructionStep(
                  '4',
                  'Rửa sạch cảm biến bằng nước cất, lau khô.',
                ),
                _buildInstructionStep(
                  '5',
                  'Nhúng cảm biến vào dung dịch chuẩn pH 4.0, đợi ổn định rồi nhấn nút Calib 4.0.',
                ),
                _buildInstructionStep(
                  '6',
                  'Nhấn nút Lưu & Hoàn tất để lưu kết quả và thoát chế độ hiệu chuẩn.',
                ),
              ],
            ),
          ),
          SizedBox(height: 24),

          // Các nút bấm
          _buildCalibButton(
            '1. Bắt đầu hiệu chuẩn',
            Color(0xFF3B82F6),
            () async {
              await SupabaseService.instance.sendDeviceCommand(
                _activePondId,
                'enterph',
              );
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Đã gửi lệnh Bắt đầu hiệu chuẩn')),
                );
              }
            },
          ),
          SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildCalibButton(
                  '2. Calib pH 7.0',
                  Color(0xFFC77DFF),
                  () async {
                    await SupabaseService.instance.sendDeviceCommand(
                      _activePondId,
                      '7.0',
                    );
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Đã gửi lệnh Calib pH 7.0')),
                      );
                    }
                  },
                  isOutlined: true,
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: _buildCalibButton(
                  '3. Calib pH 4.0',
                  Color(0xFFFF8C42),
                  () async {
                    await SupabaseService.instance.sendDeviceCommand(
                      _activePondId,
                      '4.0',
                    );
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Đã gửi lệnh Calib pH 4.0')),
                      );
                    }
                  },
                  isOutlined: true,
                ),
              ),
            ],
          ),
          SizedBox(height: 12),
          _buildCalibButton('4. Lưu & Hoàn tất', Color(0xFF00A896), () async {
            await SupabaseService.instance.sendDeviceCommand(
              _activePondId,
              'exitph',
            );
            final now = DateTime.now().toUtc().toIso8601String();
            await SupabaseService.instance.updateLastCalibPh(
              _activePondId,
              now,
            );

            // Cập nhật lại UI lập tức
            final pIndex = _ponds.indexWhere((p) => p.id == _activePondId);
            if (pIndex != -1) {
              setState(() {
                _ponds[pIndex] = Pond(
                  id: _ponds[pIndex].id,
                  name: _ponds[pIndex].name,
                  volume: _ponds[pIndex].volume,
                  speciesId: _ponds[pIndex].speciesId,
                  macAddress: _ponds[pIndex].macAddress,
                  lastCalibPh: now,
                );
              });
            }
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Lưu & Hoàn tất hiệu chuẩn thành công!'),
                ),
              );
            }
          }),
        ],
      ),
    );
  }

  Widget _buildInstructionStep(String step, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$step.',
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: CustomerColors.secondaryText,
            ),
          ),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: GoogleFonts.inter(
                fontSize: 13,
                color: CustomerColors.secondaryText,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCalibButton(
    String label,
    Color color,
    VoidCallback onPressed, {
    bool isOutlined = false,
  }) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: isOutlined ? Colors.transparent : color,
        foregroundColor: isOutlined ? color : CustomerColors.text,
        elevation: 0,
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: isOutlined
              ? BorderSide(color: color, width: 1.5)
              : BorderSide.none,
        ),
      ),
      child: Text(
        label,
        style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600),
      ),
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
//                  ADD POND DIALOG
// ════════════════════════════════════════════════════════════
class _AddPondDialog extends StatefulWidget {
  final String userId;
  final List<Map<String, dynamic>> fishSpeciesList;

  const _AddPondDialog({required this.userId, required this.fishSpeciesList});

  @override
  State<_AddPondDialog> createState() => _AddPondDialogState();
}

class _AddPondDialogState extends State<_AddPondDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _volumeController = TextEditingController();
  final _macController = TextEditingController();
  int? _speciesId;
  bool _saving = false;
  String _error = '';

  @override
  void dispose() {
    _nameController.dispose();
    _volumeController.dispose();
    _macController.dispose();
    super.dispose();
  }

  InputDecoration _decoration(String hint) => InputDecoration(
    hintText: hint,
    hintStyle: GoogleFonts.inter(fontSize: 13, color: CustomerColors.mutedText),
    filled: true,
    fillColor: CustomerColors.text.withValues(alpha: 0.04),
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: CustomerColors.border),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: CustomerColors.border),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: Color(0xFF00A896), width: 1.5),
    ),
    errorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: Color(0xFFFF6B6B)),
    ),
    focusedErrorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: Color(0xFFFF6B6B)),
    ),
    errorStyle: GoogleFonts.inter(fontSize: 11, color: const Color(0xFFFF6B6B)),
  );

  Widget _label(String text, {bool optional = false}) => Padding(
    padding: const EdgeInsets.only(bottom: 7),
    child: Text(
      optional ? '$text (TÙY CHỌN)' : text,
      style: GoogleFonts.inter(
        fontSize: 9,
        fontWeight: FontWeight.w600,
        color: CustomerColors.mutedText,
        letterSpacing: 0.8,
      ),
    ),
  );

  Future<void> _submit() async {
    if (_saving || !_formKey.currentState!.validate()) return;
    final volumeText = _volumeController.text.trim().replaceAll(',', '.');
    setState(() {
      _saving = true;
      _error = '';
    });
    var completed = false;
    try {
      final created = await SupabaseService.instance.createTank(
        userId: widget.userId,
        name: _nameController.text,
        volumeLiters: volumeText.isEmpty ? null : double.parse(volumeText),
        speciesId: _speciesId,
        macAddress: _macController.text,
      );
      if (!mounted) return;
      completed = true;
      Navigator.of(context).pop(created);
    } catch (error) {
      if (!mounted) return;
      final message = error
          .toString()
          .replaceFirst('Bad state: ', '')
          .replaceFirst('Invalid argument(s): ', '')
          .replaceFirst('Exception: ', '');
      setState(() => _error = message);
    } finally {
      if (mounted && !completed) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: CustomerColors.card,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: CustomerColors.border),
      ),
      title: Row(
        children: [
          const _AquaSvg('plus', size: 20, color: Color(0xFF00A896)),
          const SizedBox(width: 8),
          Text(
            'Thêm bể cá mới',
            style: GoogleFonts.inter(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: CustomerColors.text,
            ),
          ),
        ],
      ),
      content: SizedBox(
        width: 360,
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _label('TÊN BỂ CÁ'),
                TextFormField(
                  controller: _nameController,
                  autofocus: true,
                  enabled: !_saving,
                  textInputAction: TextInputAction.next,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: CustomerColors.text,
                  ),
                  decoration: _decoration('VD: Bể Rồng Phòng Ngủ'),
                  validator: (value) => value == null || value.trim().isEmpty
                      ? 'Vui lòng nhập tên bể'
                      : null,
                ),
                const SizedBox(height: 14),
                _label('THỂ TÍCH (LÍT)'),
                TextFormField(
                  controller: _volumeController,
                  enabled: !_saving,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  textInputAction: TextInputAction.next,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: CustomerColors.text,
                  ),
                  decoration: _decoration('VD: 250'),
                  validator: (value) {
                    final text = value?.trim().replaceAll(',', '.') ?? '';
                    if (text.isEmpty) return null;
                    final volume = double.tryParse(text);
                    return volume == null || volume <= 0
                        ? 'Thể tích phải là số lớn hơn 0'
                        : null;
                  },
                ),
                const SizedBox(height: 14),
                _label('LOÀI CÁ', optional: true),
                DropdownButtonFormField<int>(
                  initialValue: _speciesId,
                  isExpanded: true,
                  dropdownColor: CustomerColors.card,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: CustomerColors.text,
                  ),
                  decoration: _decoration('-- Chọn loài cá --'),
                  items: [
                    const DropdownMenuItem<int>(
                      value: null,
                      child: Text('Không xác định'),
                    ),
                    ...widget.fishSpeciesList.map(
                      (species) => DropdownMenuItem<int>(
                        value: species['id'] as int,
                        child: Text(species['species_name'] as String),
                      ),
                    ),
                  ],
                  onChanged: _saving
                      ? null
                      : (value) => setState(() => _speciesId = value),
                ),
                const SizedBox(height: 14),
                _label('MÃ THIẾT BỊ (MAC)', optional: true),
                TextFormField(
                  controller: _macController,
                  enabled: !_saving,
                  textCapitalization: TextCapitalization.characters,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _submit(),
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: CustomerColors.text,
                  ),
                  decoration: _decoration(
                    'VD: 68:FE:71:16:A5:18 hoặc để trống',
                  ),
                ),
                if (_error.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Text(
                      _error,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: const Color(0xFFFF6B6B),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
      actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      actions: [
        TextButton(
          onPressed: _saving ? null : () => Navigator.of(context).pop(),
          style: TextButton.styleFrom(
            foregroundColor: CustomerColors.secondaryText,
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
          ),
          child: Text('Hủy', style: GoogleFonts.inter(fontSize: 13)),
        ),
        ElevatedButton(
          onPressed: _saving ? null : _submit,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF00A896),
            foregroundColor: CustomerColors.text,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          child: _saving
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : Text(
                  'Thêm bể',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
        ),
      ],
    );
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
            ? Color(0xFF00A896).withValues(alpha: 0.10)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          // Check mark
          Padding(
            padding: const EdgeInsets.only(left: 10),
            child: isActive
                ? _AquaSvg('check', size: 14, color: Color(0xFF00A896))
                : SizedBox(width: 14),
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
                        ? CustomerColors.accentText
                        : CustomerColors.text.withValues(alpha: 0.7),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ),
          ),
          // Action buttons
          IconButton(
            onPressed: onSettings,
            icon: _AquaSvg(
              'settings',
              size: 15,
              color: CustomerColors.mutedText,
            ),
            tooltip: 'Cấu hình',
            splashRadius: 16,
            padding: const EdgeInsets.all(6),
            constraints: BoxConstraints(minWidth: 32, minHeight: 32),
          ),
          IconButton(
            onPressed: onDelete,
            icon: _AquaSvg(
              'trash',
              size: 15,
              color: onDelete != null
                  ? CustomerColors.mutedText
                  : CustomerColors.text.withValues(alpha: 0.1),
            ),
            tooltip: onDelete != null ? 'Xóa' : 'Cần ít nhất 1 bể',
            splashRadius: 16,
            padding: const EdgeInsets.all(6),
            constraints: BoxConstraints(minWidth: 32, minHeight: 32),
          ),
          SizedBox(width: 4),
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
    final accent = sensor.name == 'Nhiệt độ' || sensor.name == 'Mực nước'
        ? CustomerColors.waterText
        : CustomerColors.accentText;
    final symbol = _sensorSvgName(sensor.name);
    return Container(
      decoration: BoxDecoration(
        color: CustomerColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: CustomerColors.border, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(
              alpha: CustomerColors.dark ? 0.08 : 0.03,
            ),
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
                    color: accent.withValues(alpha: 0.12),
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: _AquaSvg(symbol, size: 16, color: accent),
                ),
                SizedBox(width: 8),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(
                      sensor.name,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: CustomerColors.secondaryText,
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
                    color: sensorStatusColor(
                      sensor.status,
                    ).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(5),
                    border: Border.all(
                      color: sensorStatusColor(
                        sensor.status,
                      ).withValues(alpha: 0.2),
                      width: 1,
                    ),
                  ),
                  child: Text(
                    sensor.hasData ? sensor.status : 'Chưa có',
                    style: GoogleFonts.inter(
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      color: sensorStatusColor(sensor.status),
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 10),
            RichText(
              text: TextSpan(
                children: [
                  if (sensor.name == 'Mực nước')
                    TextSpan(
                      text: !sensor.hasData
                          ? '--'
                          : sensor.value == 1.0
                          ? 'Ổn định'
                          : 'Cạn nước',
                      style: GoogleFonts.inter(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: sensor.hasData
                            ? sensorStatusColor(sensor.status)
                            : CustomerColors.mutedText,
                        height: 1.0,
                      ),
                    )
                  else
                    TextSpan(
                      text: sensor.hasData
                          ? sensor.value.toStringAsFixed(2)
                          : '--',
                      style: GoogleFonts.inter(
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        color: sensor.hasData
                            ? sensorStatusColor(sensor.status)
                            : CustomerColors.mutedText,
                        height: 1.0,
                      ),
                    ),
                  if (sensor.hasData &&
                      sensor.unit.isNotEmpty &&
                      sensor.name != 'Mực nước')
                    TextSpan(
                      text: ' ${sensor.unit}',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: accent,
                      ),
                    ),
                ],
              ),
            ),
            Spacer(),
            if (!sensor.hasData)
              const SizedBox(height: 42)
            else if (sensor.name == 'Mực nước')
              Container(
                height: 42,
                alignment: Alignment.center,
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 8,
                        decoration: BoxDecoration(
                          color: CustomerColors.text.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: FractionallySizedBox(
                          alignment: Alignment.centerLeft,
                          widthFactor: sensor.value == 1.0 ? 1.0 : 0.15,
                          child: Container(
                            decoration: BoxDecoration(
                              color: sensor.value == 1.0
                                  ? accent
                                  : Color(0xFFFF6B6B),
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
                child: SparklineChart(data: sensor.history, color: accent),
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
    if (data.isEmpty) return const SizedBox.shrink();
    final spots = data.asMap().entries.map((e) {
      return FlSpot(e.key.toDouble(), e.value);
    }).toList();

    final minY = data.reduce(min);
    final maxY = data.reduce(max);
    final padding = (maxY - minY) * 0.3;

    return LineChart(
      LineChartData(
        gridData: FlGridData(show: false),
        titlesData: FlTitlesData(show: false),
        borderData: FlBorderData(show: false),
        minX: 0,
        maxX: (data.length - 1).toDouble(),
        minY: minY - padding,
        maxY: maxY + padding,
        lineTouchData: LineTouchData(enabled: false),
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            curveSmoothness: 0.35,
            color: color,
            barWidth: 2,
            isStrokeCapRound: true,
            dotData: FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  color.withValues(alpha: 0.25),
                  color.withValues(alpha: 0.0),
                ],
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
        color: CustomerColors.card.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: sensor.color.withValues(alpha: 0.15),
          width: 1,
        ),
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
                alignment: Alignment.center,
                child: _AquaSvg(
                  _sensorSvgName(sensor.name),
                  color: sensor.color,
                  size: 22,
                ),
              ),
              SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      sensor.name,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: CustomerColors.text,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Thời gian thực',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: CustomerColors.mutedText,
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    !sensor.hasData
                        ? '--'
                        : sensor.name == 'Mực nước'
                        ? (sensor.value == 1.0 ? 'Bình thường' : 'Cạn')
                        : '${sensor.value.toStringAsFixed(2)}${sensor.unit.isNotEmpty ? ' ${sensor.unit}' : ''}',
                    style: GoogleFonts.inter(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: sensorStatusColor(sensor.status),
                    ),
                  ),
                  SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: sensorStatusColor(
                        sensor.status,
                      ).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: sensorStatusColor(
                          sensor.status,
                        ).withValues(alpha: 0.2),
                      ),
                    ),
                    child: Text(
                      sensor.status,
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: sensorStatusColor(sensor.status),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          SizedBox(height: 18),
          if (!sensor.hasData)
            const SizedBox(
              height: 120,
              child: Center(child: Text('Chưa có dữ liệu cảm biến')),
            )
          else if (sensor.name == 'Mực nước')
            Container(
              height: 120,
              alignment: Alignment.center,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _AquaSvg(
                    sensor.value == 1.0 ? 'check' : 'alert',
                    size: 48,
                    color: sensor.value == 1.0
                        ? Color(0xFF00A896)
                        : Color(0xFFFF6B6B),
                  ),
                  SizedBox(height: 12),
                  Text(
                    sensor.value == 1.0
                        ? 'Mực nước đang ở mức ổn định'
                        : 'Cảnh báo: Bể đang cạn nước!',
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: sensor.value == 1.0
                          ? CustomerColors.accentText
                          : Color(0xFFFF6B6B),
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
                SizedBox(height: 12),
                Row(
                  children: [
                    _statChip(
                      'Min',
                      sensor.history.reduce(min).toStringAsFixed(2),
                      sensor.color,
                    ),
                    SizedBox(width: 10),
                    _statChip(
                      'Max',
                      sensor.history.reduce(max).toStringAsFixed(2),
                      sensor.color,
                    ),
                    SizedBox(width: 10),
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
                color: CustomerColors.mutedText,
                letterSpacing: 0.5,
              ),
            ),
            SizedBox(height: 2),
            Text(
              value,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: CustomerColors.readableForeground(color),
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
      final angle = math.atan2(
        -size.height,
        size.width * 0.5,
      ); // Approx tangent
      canvas.drawLine(
        Offset(size.width, 0),
        Offset(
          size.width - headLength * math.cos(angle - math.pi / 6),
          0 - headLength * math.sin(angle - math.pi / 6),
        ),
        paint,
      );
      canvas.drawLine(
        Offset(size.width, 0),
        Offset(
          size.width - headLength * math.cos(angle + math.pi / 6),
          0 - headLength * math.sin(angle + math.pi / 6),
        ),
        paint,
      );
    } else {
      // Curve down to bottom left
      path.moveTo(size.width, 0);
      path.quadraticBezierTo(size.width * 0.5, 0, 0, size.height);

      // Draw arrow head at (0, size.height)
      final headLength = 12.0;
      final angle = math.atan2(
        size.height,
        -size.width * 0.5,
      ); // Approx tangent
      canvas.drawLine(
        Offset(0, size.height),
        Offset(
          0 - headLength * math.cos(angle - math.pi / 6),
          size.height - headLength * math.sin(angle - math.pi / 6),
        ),
        paint,
      );
      canvas.drawLine(
        Offset(0, size.height),
        Offset(
          0 - headLength * math.cos(angle + math.pi / 6),
          size.height - headLength * math.sin(angle + math.pi / 6),
        ),
        paint,
      );
    }

    // Draw dashed path
    double dashWidth = 8, dashSpace = 8, distance = 0;
    for (ui.PathMetric pathMetric in path.computeMetrics()) {
      while (distance < pathMetric.length) {
        final extractPath = pathMetric.extractPath(
          distance,
          distance + dashWidth,
        );
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
          const validSeverities = [
            'both',
            'critical_only',
            'warning_only',
            'none',
          ];
          _severity = validSeverities.contains(rawSeverity)
              ? rawSeverity
              : 'both';
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
      await SupabaseService.instance.client
          .from('tanks')
          .update({
            'tank_name': _nameCtrl.text.trim(),
            'water_volume_liter': _volumeCtrl.text.trim().isNotEmpty
                ? double.tryParse(_volumeCtrl.text.trim())
                : null,
            'species_id': _speciesId,
          })
          .eq('id', tankId);

      // Update mac address
      final mac = _macCtrl.text.trim();
      if (mac != widget.pond.macAddress) {
        if (widget.pond.macAddress != null &&
            widget.pond.macAddress!.isNotEmpty) {
          await SupabaseService.instance.client
              .from('devices')
              .update({'tank_id': null})
              .eq('mac_address', widget.pond.macAddress!);
        }
        if (mac.isNotEmpty) {
          final existingDevice = await SupabaseService.instance.client
              .from('devices')
              .select('id')
              .eq('mac_address', mac)
              .maybeSingle();
          if (existingDevice != null) {
            await SupabaseService.instance.client
                .from('devices')
                .update({'tank_id': tankId})
                .eq('mac_address', mac);
          } else {
            throw Exception('Không tìm thấy thiết bị với địa chỉ MAC này.');
          }
        }
      }

      // Update notif settings
      await SupabaseService.instance.client
          .from('tank_notification_settings')
          .upsert({
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

  Widget _buildTextField(
    String label,
    TextEditingController controller, {
    String? hint,
    TextInputType? type,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: CustomerColors.secondaryText,
          ),
        ),
        SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: type,
          style: GoogleFonts.inter(fontSize: 14, color: CustomerColors.text),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: GoogleFonts.inter(color: CustomerColors.mutedText),
            filled: true,
            fillColor: CustomerColors.text.withValues(alpha: 0.04),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 12,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(
                color: CustomerColors.text.withValues(alpha: 0.1),
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(
                color: CustomerColors.text.withValues(alpha: 0.1),
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: Color(0xFF00A896)),
            ),
          ),
        ),
        SizedBox(height: 16),
      ],
    );
  }

  Widget _buildDropdown<T>(
    String label,
    T? value,
    List<DropdownMenuItem<T>> items,
    ValueChanged<T?> onChanged,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: CustomerColors.secondaryText,
          ),
        ),
        SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: CustomerColors.text.withValues(alpha: 0.04),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: CustomerColors.text.withValues(alpha: 0.1),
            ),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<T>(
              value: value,
              items: items,
              onChanged: onChanged,
              isExpanded: true,
              dropdownColor: CustomerColors.subtle,
              style: GoogleFonts.inter(
                fontSize: 14,
                color: CustomerColors.text,
              ),
              icon: _AquaSvg(
                'chevronDown',
                size: 18,
                color: CustomerColors.mutedText,
              ),
            ),
          ),
        ),
        SizedBox(height: 16),
      ],
    );
  }

  Widget _buildSwitch(String label, bool value, ValueChanged<bool> onChanged) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(fontSize: 14, color: CustomerColors.text),
        ),
        Switch(
          value: value,
          onChanged: onChanged,
          activeThumbColor: Color(0xFF00A896),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: CustomerColors.card,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: CustomerColors.text.withValues(alpha: 0.08)),
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
                color: CustomerColors.text,
              ),
            ),
            SizedBox(height: 20),
            // Tabs
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _tabIndex = 0),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        border: Border(
                          bottom: BorderSide(
                            color: _tabIndex == 0
                                ? Color(0xFF4DA6FF)
                                : Colors.transparent,
                            width: 2,
                          ),
                        ),
                      ),
                      child: Text(
                        'Thông tin chung',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: _tabIndex == 0
                              ? FontWeight.w600
                              : FontWeight.w400,
                          color: _tabIndex == 0
                              ? Color(0xFF4DA6FF)
                              : CustomerColors.mutedText,
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
                        border: Border(
                          bottom: BorderSide(
                            color: _tabIndex == 1
                                ? Color(0xFF00A896)
                                : Colors.transparent,
                            width: 2,
                          ),
                        ),
                      ),
                      child: Text(
                        'Cài đặt cảnh báo',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: _tabIndex == 1
                              ? FontWeight.w600
                              : FontWeight.w400,
                          color: _tabIndex == 1
                              ? CustomerColors.accentText
                              : CustomerColors.mutedText,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 20),

            // Tab Content
            if (_tabIndex == 0) ...[
              _buildTextField(
                'TÊN BỂ CÁ',
                _nameCtrl,
                hint: 'VD: Bể Rồng Phòng Khách',
              ),
              _buildTextField(
                'THỂ TÍCH (LÍT)',
                _volumeCtrl,
                type: TextInputType.number,
                hint: 'VD: 250',
              ),
              Builder(
                builder: (_) {
                  // Validate _speciesId exists in the list to prevent DropdownButton crash
                  final speciesIds = widget.fishSpeciesList
                      .map((s) => s['id'] as int)
                      .toList();
                  final safeSpeciesId =
                      (_speciesId != null && speciesIds.contains(_speciesId))
                      ? _speciesId
                      : null;
                  return _buildDropdown<int>(
                    'LOÀI CÁ',
                    safeSpeciesId,
                    [
                      DropdownMenuItem(
                        value: null,
                        child: Text('Không xác định'),
                      ),
                      ...widget.fishSpeciesList.map(
                        (s) => DropdownMenuItem(
                          value: s['id'] as int,
                          child: Text(s['species_name'] as String),
                        ),
                      ),
                    ],
                    (val) => setState(() => _speciesId = val),
                  );
                },
              ),
              _buildTextField(
                'MÃ THIẾT BỊ (MAC)',
                _macCtrl,
                hint: 'AA:BB:CC:DD:EE:FF',
              ),
            ] else ...[
              Text(
                'KÊNH NHẬN THÔNG BÁO',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: CustomerColors.secondaryText,
                ),
              ),
              SizedBox(height: 8),
              _buildSwitch(
                'Thông báo qua Email',
                _email,
                (v) => setState(() => _email = v),
              ),
              _buildSwitch(
                'Thông báo qua trình duyệt web',
                _web,
                (v) => setState(() => _web = v),
              ),
              _buildSwitch(
                'Thông báo trên App',
                _app,
                (v) => setState(() => _app = v),
              ),
              SizedBox(height: 16),
              _buildDropdown<int>(
                'THỜI GIAN NHẮC LẠI (COOLDOWN)',
                _cooldown,
                [
                  DropdownMenuItem(value: 0, child: Text('Không nhắc lại')),
                  DropdownMenuItem(
                    value: 1,
                    child: Text('Nhắc nhở liên tục (1 phút)'),
                  ),
                  DropdownMenuItem(
                    value: 15,
                    child: Text('Nhắc lại sau 15 phút'),
                  ),
                  DropdownMenuItem(
                    value: 30,
                    child: Text('Nhắc lại sau 30 phút'),
                  ),
                  DropdownMenuItem(
                    value: 60,
                    child: Text('Nhắc lại sau 1 giờ'),
                  ),
                ],
                (val) => setState(() => _cooldown = val!),
              ),
              _buildDropdown<String>('BỘ LỌC MỨC ĐỘ', _severity, [
                DropdownMenuItem(
                  value: 'both',
                  child: Text('Nhận tất cả cảnh báo'),
                ),
                DropdownMenuItem(
                  value: 'critical_only',
                  child: Text('Chỉ nhận cảnh báo Nguy hiểm'),
                ),
                DropdownMenuItem(
                  value: 'warning_only',
                  child: Text('Chỉ nhận cảnh báo Cảnh báo'),
                ),
                DropdownMenuItem(value: 'none', child: Text('Tắt thông báo')),
              ], (val) => setState(() => _severity = val!)),
            ],

            if (_errorMsg.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Text(
                  _errorMsg,
                  style: GoogleFonts.inter(
                    color: Colors.redAccent,
                    fontSize: 13,
                  ),
                ),
              ),

            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    'Hủy',
                    style: GoogleFonts.inter(
                      color: CustomerColors.secondaryText,
                      fontSize: 14,
                    ),
                  ),
                ),
                SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _isLoading ? null : _saveSettings,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF00A896),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: _isLoading
                      ? SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: CustomerColors.text,
                          ),
                        )
                      : Text(
                          'Lưu thay đổi',
                          style: GoogleFonts.inter(
                            color: CustomerColors.text,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
