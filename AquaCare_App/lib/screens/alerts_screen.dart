import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../services/supabase_service.dart';

class AlertsScreen extends StatefulWidget {
  final String tankId;

  const AlertsScreen({super.key, required this.tankId});

  @override
  State<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends State<AlertsScreen> {
  List<Map<String, dynamic>> _alerts = [];
  bool _isLoading = true;
  bool _isLoadingMore = false;
  bool _hasMore = true;
  int _offset = 0;
  final int _limit = 50;
  String _selectedFilter = 'Tất cả';

  final List<String> _filters = [
    'Tất cả',
    'pH',
    'Nhiệt độ',
    'TDS',
    'Mực nước'
  ];

  @override
  void initState() {
    super.initState();
    _loadAlerts(refresh: true);
  }

  Future<void> _loadAlerts({bool refresh = false}) async {
    if (widget.tankId.isEmpty) {
      setState(() => _isLoading = false);
      return;
    }

    if (refresh) {
      setState(() {
        _isLoading = true;
        _offset = 0;
        _hasMore = true;
      });
    } else {
      setState(() => _isLoadingMore = true);
    }

    final newAlerts = await SupabaseService.instance.getAlertsWithPagination(
      widget.tankId,
      type: _selectedFilter == 'Tất cả' ? null : _selectedFilter,
      offset: _offset,
      limit: _limit,
    );

    setState(() {
      if (refresh) {
        _alerts = newAlerts;
      } else {
        _alerts.addAll(newAlerts);
      }
      
      _offset += newAlerts.length;
      _hasMore = newAlerts.length == _limit;
      _isLoading = false;
      _isLoadingMore = false;
    });
  }

  Map<String, List<Map<String, dynamic>>> _groupAlertsByTime(
      List<Map<String, dynamic>> alerts) {
    final grouped = <String, List<Map<String, dynamic>>>{
      'Hôm nay': [],
      'Hôm qua': [],
      'Tuần này': [],
      'Cũ hơn': [],
    };

    final now = DateTime.now();
    final formatter = DateFormat('yyyy-MM-dd');
    
    final todayStr = formatter.format(now);
    final yesterdayStr = formatter.format(now.subtract(const Duration(days: 1)));
    final sevenDaysAgo = now.subtract(const Duration(days: 7));

    for (final alert in alerts) {
      final isoTime = alert['created_at'] as String?;
      if (isoTime == null) continue;

      final dt = DateTime.parse(isoTime).toLocal();
      final dateStr = formatter.format(dt);

      if (dateStr == todayStr) {
        grouped['Hôm nay']!.add(alert);
      } else if (dateStr == yesterdayStr) {
        grouped['Hôm qua']!.add(alert);
      } else if (dt.isAfter(sevenDaysAgo)) {
        grouped['Tuần này']!.add(alert);
      } else {
        grouped['Cũ hơn']!.add(alert);
      }
    }

    grouped.removeWhere((key, value) => value.isEmpty);
    return grouped;
  }

  @override
  Widget build(BuildContext context) {
    if (widget.tankId.isEmpty) {
      return Center(
        child: Text(
          'Chọn một bể cá để xem cảnh báo',
          style: GoogleFonts.inter(
            fontSize: 13,
            color: Colors.white.withOpacity(0.4),
          ),
        ),
      );
    }

    return Column(
      children: [
        // Filter Bar
        SizedBox(
          height: 60,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            itemCount: _filters.length,
            itemBuilder: (context, index) {
              final filter = _filters[index];
              final isSelected = filter == _selectedFilter;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: GestureDetector(
                  onTap: () {
                    if (_selectedFilter != filter) {
                      setState(() => _selectedFilter = filter);
                      _loadAlerts(refresh: true);
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: isSelected
                          ? const Color(0xFF00A896).withOpacity(0.2)
                          : Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isSelected
                            ? const Color(0xFF00A896)
                            : Colors.white.withOpacity(0.1),
                      ),
                    ),
                    child: Text(
                      filter,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                        color: isSelected ? const Color(0xFF00A896) : Colors.white.withOpacity(0.6),
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),

        // List View
        Expanded(
          child: _isLoading
              ? const Center(
                  child: CircularProgressIndicator(color: Color(0xFF00A896)),
                )
              : _alerts.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.check_circle_outline_rounded,
                            size: 56,
                            color: const Color(0xFF00A896).withOpacity(0.3),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Chưa có cảnh báo nào',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: Colors.white.withOpacity(0.5),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Hệ thống đang hoạt động ổn định 🎉',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: Colors.white.withOpacity(0.3),
                            ),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: () => _loadAlerts(refresh: true),
                      color: const Color(0xFF00A896),
                      backgroundColor: const Color(0xFF0F1A30),
                      child: ListView(
                        physics: const AlwaysScrollableScrollPhysics(
                          parent: BouncingScrollPhysics(),
                        ),
                        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                        children: [
                          ..._groupAlertsByTime(_alerts).entries.map((entry) {
                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Padding(
                                  padding: const EdgeInsets.only(
                                      top: 16, bottom: 12, left: 4),
                                  child: Text(
                                    entry.key,
                                    style: GoogleFonts.inter(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white.withOpacity(0.7),
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ),
                                ...entry.value.map((alert) => Padding(
                                      padding: const EdgeInsets.only(bottom: 12),
                                      child: _AlertCardWidget(alert: alert),
                                    )),
                              ],
                            );
                          }),

                          // Load More Button
                          if (_hasMore)
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              child: _isLoadingMore
                                  ? const Center(
                                      child: SizedBox(
                                        width: 24,
                                        height: 24,
                                        child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: Color(0xFF00A896)),
                                      ),
                                    )
                                  : TextButton(
                                      onPressed: () => _loadAlerts(refresh: false),
                                      child: Text(
                                        'Xem thêm',
                                        style: GoogleFonts.inter(
                                          color: const Color(0xFF00A896),
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                            ),
                        ],
                      ),
                    ),
        ),
      ],
    );
  }
}

class _AlertCardWidget extends StatelessWidget {
  final Map<String, dynamic> alert;
  const _AlertCardWidget({required this.alert});

  static const Map<String, Map<String, dynamic>> _alertConfig = {
    'pH': {
      'icon': Icons.science_outlined,
      'color': 0xFFFF6B6B,
      'guidance': 'Kiểm tra hệ thống lọc, cân nhắc thay 20-30% nước.',
    },
    'Nhiệt độ': {
      'icon': Icons.thermostat_outlined,
      'color': 0xFFFF8C42,
      'guidance': 'Kiểm tra bộ điều nhiệt, di chuyển bể tránh ánh nắng trực tiếp.',
    },
    'TDS': {
      'icon': Icons.water_drop_outlined,
      'color': 0xFFC77DFF,
      'guidance': 'Nồng độ chất hòa tan bất thường, cần thay nước hoặc vệ sinh bộ lọc.',
    },
    'Mực nước': {
      'icon': Icons.waves_outlined,
      'color': 0xFF4DA6FF,
      'guidance': 'Kiểm tra van cấp nước và châm thêm nước ngay.',
    },
  };

  String _timeAgo(String? isoTime) {
    if (isoTime == null) return '';
    try {
      final dt = DateTime.parse(isoTime).toLocal();
      final diff = DateTime.now().difference(dt);
      if (diff.inSeconds < 60) return 'Vừa xong';
      if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
      if (diff.inHours < 24) return '${diff.inHours} giờ trước';
      return '${diff.inDays} ngày trước';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final alertType = alert['alert_type'] as String? ?? '';
    final config = _alertConfig[alertType] ?? {
      'icon': Icons.warning_amber_outlined,
      'color': 0xFFFF6B6B,
      'guidance': 'Kiểm tra bể cá và hệ thống cảm biến.',
    };
    final color = Color(config['color'] as int);
    final icon = config['icon'] as IconData;
    final guidance = config['guidance'] as String;
    final message = alert['alert_message'] as String? ?? 'Cảnh báo hệ thống';
    final actualValue = alert['actual_value'];
    final isRead = alert['is_read'] == true;
    final timeStr = _timeAgo(alert['created_at'] as String?);

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0F1A30).withOpacity(0.9),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isRead ? Colors.white.withOpacity(0.06) : color.withOpacity(0.25),
          width: 1,
        ),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 20),
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
                        'Cảnh báo $alertType',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    if (!isRead)
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: color,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: color.withOpacity(0.4),
                              blurRadius: 6,
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  message,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: Colors.white.withOpacity(0.5),
                    height: 1.5,
                  ),
                ),
                if (actualValue != null) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: color.withOpacity(0.15)),
                    ),
                    child: Text(
                      'Giá trị: $actualValue',
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: color,
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.03),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white.withOpacity(0.06)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.lightbulb_outline_rounded,
                        size: 14,
                        color: const Color(0xFFFFD93D).withOpacity(0.6),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          guidance,
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            color: Colors.white.withOpacity(0.35),
                            height: 1.5,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  timeStr,
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    color: color.withOpacity(0.5),
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
