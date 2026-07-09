import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';
import '../screens/dashboard_screen.dart'; // To import SensorData

class SensorHistoryDrillDown extends StatefulWidget {
  final String activePondId;
  final SensorData sensor;

  const SensorHistoryDrillDown({
    super.key,
    required this.activePondId,
    required this.sensor,
  });

  @override
  State<SensorHistoryDrillDown> createState() => _SensorHistoryDrillDownState();
}

class _SensorHistoryDrillDownState extends State<SensorHistoryDrillDown> {
  String _dateFilter = 'today'; // 'today', 'yesterday', '7days', 'custom'
  String _statusFilter = 'all'; // 'all', 'Tốt', 'Cảnh báo', 'Nguy hiểm'

  DateTime? _customStart;
  DateTime? _customEnd;

  int _displayCount = 10;

  bool _isLoadingL1 = false;
  List<Map<String, dynamic>> _dataL1 = [];

  // Lưu trạng thái mở rộng của các giờ: key là chuỗi "dd/MM/yyyy HH:00"
  Set<String> _expandedHours = {};

  // Dữ liệu phút (L2) cho mỗi giờ: key là chuỗi "dd/MM/yyyy HH:00"
  Map<String, List<Map<String, dynamic>>> _dataL2 = {};
  Map<String, bool> _loadingL2 = {};

  final _supabase = Supabase.instance.client;

  @override
  void initState() {
    super.initState();
    _fetchL1();
  }

  @override
  void didUpdateWidget(covariant SensorHistoryDrillDown oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.activePondId != widget.activePondId ||
        oldWidget.sensor.name != widget.sensor.name) {
      _expandedHours.clear();
      _dataL2.clear();
      _displayCount = 10;
      _fetchL1();
    }
  }

  String _mapSensorToDbField(String sensorName) {
    switch (sensorName) {
      case 'pH':
        return 'ph';
      case 'Nhiệt độ':
        return 'temp';
      case 'TDS':
        return 'tds';
      case 'Mực nước':
        return 'water_level_ok';
      default:
        return 'temp';
    }
  }

  Map<String, dynamic> _getSensorConfig(String sensorName) {
    if (sensorName == 'Nhiệt độ')
      return {
        'good': [24, 28],
        'warn': [22, 30],
      };
    if (sensorName == 'pH')
      return {
        'good': [6.5, 7.5],
        'warn': [6.0, 8.0],
      };
    if (sensorName == 'TDS')
      return {
        'good': [100, 300],
        'warn': [50, 400],
      };
    if (sensorName == 'Mực nước')
      return {
        'good': [1, 1],
        'warn': [1, 1],
      };
    return {
      'good': [0, 100],
      'warn': [0, 100],
    };
  }

  Color _getStatusColor(num val, Map<String, dynamic> config, String name) {
    if (name == 'Mực nước')
      return val == 1 ? const Color(0xFF00A896) : const Color(0xFFFF6B6B);
    final good = config['good'] as List;
    final warn = config['warn'] as List;
    if (val >= good[0] && val <= good[1]) return const Color(0xFF00A896);
    if (val >= warn[0] && val <= warn[1]) return const Color(0xFFFFB347);
    return const Color(0xFFFF6B6B);
  }

  String _getStatusLabel(num val, Map<String, dynamic> config, String name) {
    if (name == 'Mực nước') return val == 1 ? 'Ổn định' : 'Cạn nước';
    final good = config['good'] as List;
    final warn = config['warn'] as List;
    if (val >= good[0] && val <= good[1]) return 'Tốt';
    if (val >= warn[0] && val <= warn[1]) return 'Cảnh báo';
    return 'Nguy hiểm';
  }

  Future<void> _fetchL1() async {
    if (widget.activePondId.isEmpty) return;
    setState(() {
      _isLoadingL1 = true;
    });

    try {
      final devices = await _supabase
          .from('devices')
          .select('id')
          .eq('tank_id', widget.activePondId);
      if (devices.isEmpty) {
        setState(() => _isLoadingL1 = false);
        return;
      }
      final deviceId = devices[0]['id'];

      DateTime start = DateTime.now();
      DateTime end = DateTime.now();

      if (_dateFilter == 'today') {
        start = DateTime(start.year, start.month, start.day, 0, 0, 0);
      } else if (_dateFilter == 'yesterday') {
        start = start.subtract(const Duration(days: 1));
        start = DateTime(start.year, start.month, start.day, 0, 0, 0);
        end = DateTime(start.year, start.month, start.day, 23, 59, 59, 999);
      } else if (_dateFilter == '7days') {
        start = start.subtract(const Duration(days: 7));
        start = DateTime(start.year, start.month, start.day, 0, 0, 0);
      } else if (_dateFilter == 'custom' &&
          _customStart != null &&
          _customEnd != null) {
        start = DateTime(
          _customStart!.year,
          _customStart!.month,
          _customStart!.day,
          0,
          0,
          0,
        );
        end = DateTime(
          _customEnd!.year,
          _customEnd!.month,
          _customEnd!.day,
          23,
          59,
          59,
          999,
        );
      }

      final dbField = _mapSensorToDbField(widget.sensor.name);

      final data = await _supabase
          .from('telemetry_logs')
          .select('recorded_at, $dbField')
          .eq('device_id', deviceId)
          .gte('recorded_at', start.toUtc().toIso8601String())
          .lte('recorded_at', end.toUtc().toIso8601String())
          .order('recorded_at', ascending: false);

      Map<String, List<num>> groups = {};
      for (var row in data) {
        final date = DateTime.parse(row['recorded_at']).toLocal();
        final dateStr = DateFormat('dd/MM/yyyy HH:00').format(date);

        num val = 0;
        if (widget.sensor.name == 'Mực nước') {
          val = row[dbField] == true ? 1 : 0;
        } else {
          val = row[dbField] as num;
        }

        if (!groups.containsKey(dateStr)) {
          groups[dateStr] = [];
        }
        groups[dateStr]!.add(val);
      }

      final config = _getSensorConfig(widget.sensor.name);
      List<Map<String, dynamic>> l1 = [];

      groups.forEach((timeStr, vals) {
        final avg = vals.reduce((a, b) => a + b) / vals.length;
        final max = vals.reduce((a, b) => a > b ? a : b);
        final min = vals.reduce((a, b) => a < b ? a : b);

        Color finalSc = _getStatusColor(avg, config, widget.sensor.name);
        String finalSl = _getStatusLabel(avg, config, widget.sensor.name);

        if (widget.sensor.name == 'Mực nước') {
          final hasDanger = vals.any((v) => v == 0);
          finalSc = _getStatusColor(
            hasDanger ? 0 : 1,
            config,
            widget.sensor.name,
          );
          finalSl = _getStatusLabel(
            hasDanger ? 0 : 1,
            config,
            widget.sensor.name,
          );
        } else {
          final allLabels = vals
              .map((v) => _getStatusLabel(v, config, widget.sensor.name))
              .toList();
          if (allLabels.contains('Nguy hiểm')) {
            finalSl = 'Nguy hiểm';
            finalSc = const Color(0xFFFF6B6B);
          } else if (allLabels.contains('Cảnh báo')) {
            finalSl = 'Cảnh báo';
            finalSc = const Color(0xFFFFB347);
          } else {
            finalSl = 'Tốt';
            finalSc = const Color(0xFF00A896);
          }
        }

        DateTime hourDate = DateFormat('dd/MM/yyyy HH:00').parse(timeStr);
        final nextH = (hourDate.hour + 1).toString().padLeft(2, '0');
        final hStr = hourDate.hour.toString().padLeft(2, '0');

        String displayTime = '$hStr:00 - $nextH:00';
        if (_dateFilter != 'today') {
          displayTime = '${DateFormat('dd/MM').format(hourDate)} $displayTime';
        }

        l1.add({
          'time': timeStr,
          'displayTime': displayTime,
          'avg': avg,
          'max': max,
          'min': min,
          'sc': finalSc,
          'sl': finalSl,
          'timestamp': hourDate.millisecondsSinceEpoch,
        });
      });

      l1.sort((a, b) => b['timestamp'].compareTo(a['timestamp']));

      setState(() {
        _dataL1 = l1;
        _isLoadingL1 = false;
        _expandedHours.clear();
        _dataL2.clear();
        _displayCount = 10;
      });
    } catch (e) {
      debugPrint('Error fetchL1: $e');
      setState(() => _isLoadingL1 = false);
    }
  }

  Future<void> _fetchL2(String timeStr) async {
    setState(() {
      _loadingL2[timeStr] = true;
    });

    try {
      final devices = await _supabase
          .from('devices')
          .select('id')
          .eq('tank_id', widget.activePondId);
      if (devices.isEmpty) return;
      final deviceId = devices[0]['id'];

      DateTime start = DateFormat('dd/MM/yyyy HH:00').parse(timeStr);
      DateTime end = start.add(const Duration(hours: 1));

      final dbField = _mapSensorToDbField(widget.sensor.name);

      final data = await _supabase
          .from('telemetry_logs')
          .select('recorded_at, $dbField')
          .eq('device_id', deviceId)
          .gte('recorded_at', start.toUtc().toIso8601String())
          .lt('recorded_at', end.toUtc().toIso8601String())
          .order('recorded_at', ascending: true);

      List<Map<String, dynamic>> l2 = [];
      for (var row in data) {
        final d = DateTime.parse(row['recorded_at']).toLocal();
        final time = DateFormat('HH:mm').format(d);
        num val = 0;
        if (widget.sensor.name == 'Mực nước') {
          val = row[dbField] == true ? 1 : 0;
        } else {
          val = row[dbField] as num;
        }
        l2.add({'time': time, 'value': val});
      }

      setState(() {
        _dataL2[timeStr] = l2;
        _loadingL2[timeStr] = false;
      });
    } catch (e) {
      debugPrint('Error fetchL2: $e');
      setState(() {
        _loadingL2[timeStr] = false;
      });
    }
  }

  void _toggleExpand(String timeStr) {
    setState(() {
      if (_expandedHours.contains(timeStr)) {
        _expandedHours.remove(timeStr);
      } else {
        _expandedHours.add(timeStr);
        if (_dataL2[timeStr] == null) {
          _fetchL2(timeStr);
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // Apply status filter
    final filteredL1 = _dataL1.where((row) {
      if (_statusFilter == 'all') return true;
      String mappedLabel = row['sl'];
      if (mappedLabel == 'Ổn định') mappedLabel = 'Tốt';
      if (mappedLabel == 'Cạn nước') mappedLabel = 'Nguy hiểm';
      return mappedLabel == _statusFilter;
    }).toList();

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.05)),
      ),
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Lịch sử dữ liệu',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.onSurface,
                ),
              ),
              GestureDetector(
                onTap: _showDateBottomSheet,
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.onSurface.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Text(
                        _getDateFilterLabel(),
                        style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface),
                      ),
                      SizedBox(width: 4),
                      Icon(Icons.keyboard_arrow_down, size: 16, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.54)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 12),
          // Status filters
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildStatusFilterChip('all', 'Tất cả', Colors.blue),
                SizedBox(width: 8),
                _buildStatusFilterChip('Tốt', 'Tốt', const Color(0xFF00A896)),
                SizedBox(width: 8),
                _buildStatusFilterChip(
                  'Cảnh báo',
                  'Cảnh báo',
                  const Color(0xFFFFB347),
                ),
                SizedBox(width: 8),
                _buildStatusFilterChip(
                  'Nguy hiểm',
                  'Nguy hiểm',
                  const Color(0xFFFF6B6B),
                ),
              ],
            ),
          ),
          SizedBox(height: 16),

          if (_isLoadingL1)
            Padding(
              padding: EdgeInsets.all(24.0),
              child: Center(
                child: CircularProgressIndicator(
                  color: Color(0xFF00A896),
                  strokeWidth: 2,
                ),
              ),
            )
          else if (filteredL1.isEmpty)
            Padding(
              padding: EdgeInsets.all(24.0),
              child: Center(
                child: Text(
                  'Không có dữ liệu',
                  style: GoogleFonts.inter(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.54), fontSize: 13),
                ),
              ),
            )
          else
            Column(
              children: [
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: filteredL1.take(_displayCount).length,
                  itemBuilder: (ctx, i) {
                    final row = filteredL1[i];
                    return _buildL1Row(row);
                  },
                ),
                if (_displayCount < filteredL1.length)
                  Padding(
                    padding: EdgeInsets.only(top: 8.0),
                    child: Center(
                      child: InkWell(
                        onTap: () {
                          setState(() {
                            _displayCount += 10;
                          });
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: Padding(
                          padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.keyboard_arrow_down_rounded, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.54), size: 24),
                              Text('Tải thêm', style: GoogleFonts.inter(color: Theme.of(context).colorScheme.onSurface, fontWeight: FontWeight.w600, fontSize: 13)),
                              SizedBox(height: 2),
                              Text('Còn ${filteredL1.length - _displayCount} mục', style: GoogleFonts.inter(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.54), fontSize: 11)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
        ],
      ),
    );
  }

  String _getDateFilterLabel() {
    if (_dateFilter == 'today') return 'Hôm nay';
    if (_dateFilter == 'yesterday') return 'Hôm qua';
    if (_dateFilter == '7days') return '7 ngày qua';
    if (_dateFilter == 'custom' && _customStart != null && _customEnd != null) {
      return '${DateFormat('dd/MM').format(_customStart!)} - ${DateFormat('dd/MM').format(_customEnd!)}';
    }
    return 'Tùy chỉnh';
  }

  void _showDateBottomSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Theme.of(context).cardColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.symmetric(vertical: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildSheetOption('today', 'Hôm nay', Icons.today),
              _buildSheetOption('yesterday', 'Hôm qua', Icons.history),
              _buildSheetOption('7days', '7 ngày qua', Icons.date_range),
              _buildSheetOption('custom', 'Tùy chỉnh khoảng thời gian', Icons.calendar_month),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSheetOption(String id, String label, IconData icon) {
    final isSel = _dateFilter == id;
    return ListTile(
      leading: Icon(icon, color: isSel ? const Color(0xFF00A896) : Theme.of(context).colorScheme.onSurface.withOpacity(0.54)),
      title: Text(label, style: GoogleFonts.inter(color: isSel ? const Color(0xFF00A896) : Theme.of(context).colorScheme.onSurface, fontWeight: isSel ? FontWeight.bold : FontWeight.normal)),
      trailing: isSel ? Icon(Icons.check, color: Color(0xFF00A896)) : null,
      onTap: () async {
        Navigator.pop(context);
        if (id == 'custom') {
          final picked = await showDateRangePicker(
            context: context,
            firstDate: DateTime(2020),
            lastDate: DateTime.now(),
            initialDateRange: (_customStart != null && _customEnd != null)
                ? DateTimeRange(start: _customStart!, end: _customEnd!)
                : null,
            builder: (context, child) {
              return Theme(
                data: Theme.of(context).copyWith(
                  colorScheme: ColorScheme.dark(
                    primary: const Color(0xFF00A896),
                    onPrimary: Theme.of(context).colorScheme.onSurface,
                    surface: Theme.of(context).cardColor,
                    onSurface: Theme.of(context).colorScheme.onSurface,
                  ),
                ),
                child: child!,
              );
            },
          );
          if (picked != null) {
            setState(() {
              _dateFilter = 'custom';
              _customStart = picked.start;
              _customEnd = picked.end;
            });
            _fetchL1();
          }
        } else {
          setState(() => _dateFilter = id);
          _fetchL1();
        }
      },
    );
  }
  Widget _buildStatusFilterChip(String id, String label, Color color) {
    final isSel = _statusFilter == id;
    return GestureDetector(
      onTap: () => setState(() => _statusFilter = id),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isSel ? color : Theme.of(context).colorScheme.onSurface.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: isSel ? Theme.of(context).colorScheme.onSurface : Theme.of(context).colorScheme.onSurface.withOpacity(0.54),
          ),
        ),
      ),
    );
  }

  Widget _buildL1Row(Map<String, dynamic> row) {
    final timeStr = row['time'] as String;
    final isExpanded = _expandedHours.contains(timeStr);
    final isWater = widget.sensor.name == 'Mực nước';

    return Container(
      margin: EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: isExpanded ? Theme.of(context).colorScheme.onSurface.withOpacity(0.03) : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.05)),
      ),
      child: Column(
        children: [
          InkWell(
            onTap: () => _toggleExpand(timeStr),
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              child: Row(
                children: [
                  Icon(
                    isExpanded
                        ? Icons.keyboard_arrow_up
                        : Icons.keyboard_arrow_down,
                    color: Theme.of(context).colorScheme.onSurface.withOpacity(0.54),
                    size: 18,
                  ),
                  SizedBox(width: 8),
                  Expanded(
                    flex: 2,
                    child: Text(
                      row['displayTime'],
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Theme.of(context).colorScheme.onSurface,
                      ),
                    ),
                  ),
                  if (!isWater)
                    Expanded(
                      flex: 1,
                      child: Text(
                        '${row['avg'].toStringAsFixed(widget.sensor.name == 'pH' ? 2 : 1)} ${widget.sensor.unit}',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: Theme.of(context).colorScheme.onSurface.withOpacity(0.54),
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: (row['sc'] as Color).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      row['sl'],
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: row['sc'],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (isExpanded) _buildL2Detail(timeStr),
        ],
      ),
    );
  }

  Widget _buildL2Detail(String timeStr) {
    final isLoading = _loadingL2[timeStr] ?? false;
    final l2Data = _dataL2[timeStr] ?? [];

    if (isLoading) {
      return Padding(
        padding: EdgeInsets.all(16.0),
        child: Center(
          child: CircularProgressIndicator(
            color: Color(0xFF00A896),
            strokeWidth: 2,
          ),
        ),
      );
    }
    if (l2Data.isEmpty) {
      return Padding(
        padding: EdgeInsets.all(16.0),
        child: Center(
          child: Text(
            'Không có dữ liệu chi tiết.',
            style: GoogleFonts.inter(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.54), fontSize: 12),
          ),
        ),
      );
    }

    final isWater = widget.sensor.name == 'Mực nước';

    return Container(
      padding: EdgeInsets.fromLTRB(36, 0, 12, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Dữ liệu chi tiết (${l2Data.length} phút)',
            style: GoogleFonts.inter(fontSize: 11, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.54)),
          ),
          SizedBox(height: 12),
          Container(
            constraints: const BoxConstraints(maxHeight: 200),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.02),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.05)),
            ),
            child: ListView.separated(
              shrinkWrap: true,
              itemCount: l2Data.length,
              separatorBuilder: (ctx, i) =>
                  Divider(height: 1, color: Theme.of(context).colorScheme.onSurface.withOpacity(0.05)),
              itemBuilder: (ctx, i) {
                final d = l2Data[i];
                final config = _getSensorConfig(widget.sensor.name);
                final c = _getStatusColor(
                  d['value'],
                  config,
                  widget.sensor.name,
                );
                final l = _getStatusLabel(
                  d['value'],
                  config,
                  widget.sensor.name,
                );

                String valStr = isWater
                    ? (d['value'] == 1 ? 'Đầy nước' : 'Cạn nước')
                    : '${(d['value'] as num).toStringAsFixed(widget.sensor.name == 'pH' ? 2 : 1)} ${widget.sensor.unit}';

                return Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        d['time'],
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: Theme.of(context).colorScheme.onSurface.withOpacity(0.54),
                        ),
                      ),
                      Text(
                        valStr,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Theme.of(context).colorScheme.onSurface,
                        ),
                      ),
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: c.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          l,
                          style: GoogleFonts.inter(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: c,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
