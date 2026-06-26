import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fl_chart/fl_chart.dart';
import 'login_screen.dart';
import '../services/supabase_service.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// ─────────────────── POND MODEL ─────────────────────────────
class Pond {
  String id;
  String name;
  Pond({required this.id, required this.name});
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

  // ── Pond State ────────────────────────────────────────────
  List<Pond> _ponds = [];
  String _activePondId = '';

  Pond get _activePond {
    if (_isLoading && _ponds.isEmpty)
      return Pond(id: '', name: 'Đang đồng bộ...');
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

  final List<String> _tabTitles = ['Tổng quan', 'Cảm biến', 'Cảnh báo'];

  @override
  void initState() {
    super.initState();
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
  }

  Future<void> _loadPonds() async {
    setState(() => _isLoading = true);
    try {
      final user = Supabase.instance.client.auth.currentUser;
      print('DEBUG: User hiện tại: $user');
      final currentUserId = user?.id ?? '3da8dc87-687c-4a01-970a-2d8f2c7a04c6';
      
      print('--- DEBUG: _loadPonds started for user: $currentUserId ---');
      final data = await SupabaseService.instance.getTanks(currentUserId);
      print('--- DEBUG: Received data from getTanks: $data ---');
      if (data.isNotEmpty) {
        setState(() {
          _ponds = data
              .map(
                (json) => Pond(id: json['id'].toString(), name: json['name']),
              )
              .toList();
          _activePondId = _ponds.first.id;
        });
        await _fetchSensorsData();
      }
    } catch (e) {
      print('Error loading ponds: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchSensorsData() async {
    if (_activePondId.isEmpty) return;
    setState(() => _isLoading = true);
    try {
      print(
        '--- DEBUG: _fetchSensorsData started for pond: $_activePondId ---',
      );
      final logs = await SupabaseService.instance.getTelemetry(
        _activePondId,
        limit: 10,
      );
      print('--- DEBUG: Received ${logs.length} telemetry logs ---');

      List<double> phHistory = [];
      List<double> tempHistory = [];
      List<double> tdsHistory = [];
      List<double> waterLevelHistory = [];

      for (var log in logs.reversed) {
        phHistory.add((log['ph'] as num?)?.toDouble() ?? 7.0);
        tempHistory.add((log['temperature'] as num?)?.toDouble() ?? 26.0);
        tdsHistory.add((log['tds'] as num?)?.toDouble() ?? 250.0);
        waterLevelHistory.add(log['water_level_ok'] == true ? 1.0 : 0.0);
      }

      if (phHistory.isEmpty) phHistory = [7.0];
      if (tempHistory.isEmpty) tempHistory = [26.0];
      if (tdsHistory.isEmpty) tdsHistory = [250.0];
      if (waterLevelHistory.isEmpty) waterLevelHistory = [1.0];

      setState(() {
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
            status: waterLevelHistory.last == 1.0 ? 'Ổn định' : 'Cạn nước',
            history: waterLevelHistory,
          ),
        ];
      });
    } catch (e) {
      print('Error fetching telemetry: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
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
    _fetchSensorsData();
  }

  // ─────────────── POND CRUD ───────────────────────────────

  void _showAddPondDialog() {
    final ctrl = TextEditingController();
    final formKey = GlobalKey<FormState>();
    showDialog(
      context: context,
      barrierColor: Colors.black.withOpacity(0.65),
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

  void _showRenamePondDialog(Pond pond) {
    final ctrl = TextEditingController(text: pond.name);
    final formKey = GlobalKey<FormState>();
    showDialog(
      context: context,
      barrierColor: Colors.black.withOpacity(0.65),
      builder: (ctx) => _buildPondDialog(
        title: '✏️ Đổi tên bể cá',
        confirmLabel: 'Lưu tên',
        confirmColor: const Color(0xFF00A896),
        controller: ctrl,
        formKey: formKey,
        hint: 'Tên mới...',
        onConfirm: () {
          if (formKey.currentState!.validate()) {
            final name = ctrl.text.trim();
            Navigator.pop(ctx);
            setState(() {
              final idx = _ponds.indexWhere((p) => p.id == pond.id);
              if (idx != -1) _ponds[idx].name = name;
            });
          }
        },
      ),
    );
  }

  void _showDeletePondDialog(Pond pond) {
    showDialog(
      context: context,
      barrierColor: Colors.black.withOpacity(0.65),
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0F1A30),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: BorderSide(color: Colors.white.withOpacity(0.08)),
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
              color: Colors.white.withOpacity(0.5),
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
              foregroundColor: Colors.white.withOpacity(0.5),
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
        side: BorderSide(color: Colors.white.withOpacity(0.08)),
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
                color: Colors.white.withOpacity(0.35),
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
                  color: Colors.white.withOpacity(0.2),
                ),
                filled: true,
                fillColor: Colors.white.withOpacity(0.04),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 12,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
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
                if (v == null || v.trim().isEmpty)
                  return 'Vui lòng nhập tên bể';
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
            foregroundColor: Colors.white.withOpacity(0.5),
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
      barrierColor: Colors.black.withOpacity(0.6),
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0F1A30),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.white.withOpacity(0.08), width: 1),
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
            color: Colors.white.withOpacity(0.5),
            height: 1.5,
          ),
        ),
        actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            style: TextButton.styleFrom(
              foregroundColor: Colors.white.withOpacity(0.5),
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
                  pageBuilder: (_, __, ___) => const LoginScreen(),
                  transitionsBuilder: (_, anim, __, child) =>
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
                      child: _buildTabContent(),
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
                            color: Colors.white.withOpacity(0.5),
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

  // ───────────────── TOP BAR ──────────────────────────────
  Widget _buildTopBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 14, 16, 10),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Colors.white.withOpacity(0.05), width: 1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Logo
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1B4F72), Color(0xFF00A896)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF00A896).withOpacity(0.3),
                      blurRadius: 12,
                    ),
                  ],
                ),
                child: const Icon(Icons.water, color: Colors.white, size: 18),
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
                        color: Colors.white.withOpacity(0.3),
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
                              ).withOpacity(_pulseAnimation.value)
                            : const Color(
                                0xFF00E5A0,
                              ).withOpacity(_pulseAnimation.value),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color:
                                (_isLoading
                                        ? const Color(0xFFFFB347)
                                        : const Color(0xFF00E5A0))
                                    .withOpacity(_pulseAnimation.value * 0.6),
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
                      color: Colors.white.withOpacity(0.45),
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
                  color: Colors.white.withOpacity(0.35),
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
                      color: const Color(0xFF00A896).withOpacity(0.3),
                      style: BorderStyle.solid,
                    ),
                    color: const Color(0xFF00A896).withOpacity(0.06),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.add,
                        size: 13,
                        color: const Color(0xFF00A896).withOpacity(0.8),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Thêm bể',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: const Color(0xFF00A896).withOpacity(0.8),
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
          setState(() => _activePondId = id);
          _simulateReload();
        }
      },
      color: const Color(0xFF0F1A30),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: Colors.white.withOpacity(0.08)),
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
              onRename: () {
                Navigator.pop(ctx);
                _showRenamePondDialog(pond);
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
                  color: const Color(0xFF00A896).withOpacity(0.12),
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
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.white.withOpacity(0.10)),
        ),
        child: Row(
          children: [
            Icon(
              Icons.water,
              size: 13,
              color: const Color(0xFF00A896).withOpacity(0.8),
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
              color: Colors.white.withOpacity(0.35),
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
      {'icon': Icons.notifications_rounded, 'label': 'Cảnh báo'},
    ];

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF060E1A).withOpacity(0.95),
        border: Border(
          top: BorderSide(color: Colors.white.withOpacity(0.06), width: 1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
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
                onTap: () => setState(() => _selectedTab = i),
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
                        ? const Color(0xFF00A896).withOpacity(0.12)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(14),
                    border: isSelected
                        ? Border.all(
                            color: const Color(0xFF00A896).withOpacity(0.25),
                            width: 1,
                          )
                        : null,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        items[i]['icon'] as IconData,
                        size: 22,
                        color: isSelected
                            ? const Color(0xFF00A896)
                            : Colors.white.withOpacity(0.3),
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
                              : Colors.white.withOpacity(0.3),
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
    switch (_selectedTab) {
      case 0:
        return _buildOverviewTab();
      case 1:
        return _buildSensorsTab();
      case 2:
        return _buildAlertsTab();
      default:
        return _buildOverviewTab();
    }
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
                    color: Colors.white.withOpacity(0.7),
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
                    color: const Color(0xFF00A896).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: const Color(0xFF00A896).withOpacity(0.2),
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
            const Color(0xFF00A896).withOpacity(0.12),
            const Color(0xFF1B4F72).withOpacity(0.12),
          ],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF00A896).withOpacity(0.15)),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFF00A896).withOpacity(0.15),
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
                    color: Colors.white.withOpacity(0.4),
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
    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
      itemCount: _currentSensors.length,
      itemBuilder: (ctx, i) => Padding(
        padding: const EdgeInsets.only(bottom: 14),
        child: SensorDetailCard(sensor: _currentSensors[i]),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  //                   TAB: CẢNH BÁO
  // ══════════════════════════════════════════════════════════
  Widget _buildAlertsTab() {
    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
      itemCount: alertList.length,
      itemBuilder: (ctx, i) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: AlertCard(alert: alertList[i]),
      ),
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
  final VoidCallback onRename;
  final VoidCallback? onDelete;

  const _PondMenuItem({
    required this.pond,
    required this.isActive,
    required this.onSelect,
    required this.onRename,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: isActive
            ? const Color(0xFF00A896).withOpacity(0.10)
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
                        : Colors.white.withOpacity(0.7),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ),
          ),
          // Action buttons
          IconButton(
            onPressed: onRename,
            icon: Icon(
              Icons.edit,
              size: 15,
              color: Colors.white.withOpacity(0.3),
            ),
            tooltip: 'Đổi tên',
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
                  ? Colors.white.withOpacity(0.3)
                  : Colors.white.withOpacity(0.1),
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
        color: const Color(0xFF0F1A30).withOpacity(0.85),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: sensor.color.withOpacity(0.15), width: 1),
        boxShadow: [
          BoxShadow(
            color: sensor.color.withOpacity(0.05),
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
                    color: sensor.color.withOpacity(0.15),
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
                        color: Colors.white.withOpacity(0.5),
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
                    color: const Color(0xFF00A896).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(5),
                    border: Border.all(
                      color: const Color(0xFF00A896).withOpacity(0.2),
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
                        color: sensor.color.withOpacity(0.6),
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
                          color: Colors.white.withOpacity(0.1),
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
                colors: [color.withOpacity(0.25), color.withOpacity(0.0)],
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
        color: const Color(0xFF0F1A30).withOpacity(0.9),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: sensor.color.withOpacity(0.15), width: 1),
        boxShadow: [
          BoxShadow(
            color: sensor.color.withOpacity(0.05),
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
                  color: sensor.color.withOpacity(0.12),
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
                        color: Colors.white.withOpacity(0.3),
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
                      color: const Color(0xFF00A896).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: const Color(0xFF00A896).withOpacity(0.2),
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
          color: color.withOpacity(0.06),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withOpacity(0.1)),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 9,
                fontWeight: FontWeight.w600,
                color: Colors.white.withOpacity(0.3),
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
//                     ALERT CARD
// ════════════════════════════════════════════════════════════
class AlertCard extends StatelessWidget {
  final AlertItem alert;
  const AlertCard({super.key, required this.alert});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0F1A30).withOpacity(0.9),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: alert.color.withOpacity(0.15), width: 1),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: alert.color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(alert.icon, color: alert.color, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        alert.title,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: alert.color,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: alert.color.withOpacity(0.4),
                            blurRadius: 6,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  alert.message,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: Colors.white.withOpacity(0.4),
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  alert.time,
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    color: alert.color.withOpacity(0.6),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
