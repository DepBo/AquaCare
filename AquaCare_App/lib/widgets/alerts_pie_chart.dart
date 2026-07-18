import 'dart:async';
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/supabase_service.dart';

class AlertsPieChart extends StatefulWidget {
  final String tankId;
  final Stream<List<Map<String, dynamic>>> alertsStream;

  const AlertsPieChart({
    super.key,
    required this.tankId,
    required this.alertsStream,
  });

  @override
  State<AlertsPieChart> createState() => _AlertsPieChartState();
}

class _AlertsPieChartState extends State<AlertsPieChart> {
  Map<String, int> _distribution = {};
  bool _isLoading = true;
  StreamSubscription? _subscription;

  @override
  void initState() {
    super.initState();
    _fetchDistribution();
    
    // Listen to stream to auto-update chart when new alert arrives
    _subscription = widget.alertsStream.listen((_) {
      if (mounted) {
        _fetchDistribution();
      }
    });
  }

  @override
  void didUpdateWidget(AlertsPieChart oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.tankId != widget.tankId) {
      _subscription?.cancel();
      setState(() => _isLoading = true);
      _fetchDistribution();
      _subscription = widget.alertsStream.listen((_) {
        if (mounted) _fetchDistribution();
      });
    }
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  Future<void> _fetchDistribution() async {
    if (widget.tankId.isEmpty) return;
    
    final data = await SupabaseService.instance.getAlertDistribution(widget.tankId);
    if (mounted) {
      setState(() {
        _distribution = data;
        _isLoading = false;
      });
    }
  }

  // Define colors for each alert type
  Color _getColor(String type) {
    switch (type) {
      case 'pH':
        return const Color(0xFF00A896); // Neon teal
      case 'Nhiệt độ':
        return const Color(0xFFFF8C42); // Neon orange
      case 'TDS':
        return const Color(0xFFC77DFF); // Neon purple
      case 'Mực nước':
        return const Color(0xFF4DA6FF); // Neon blue
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.tankId.isEmpty) return const SizedBox.shrink();

    final hasData = _distribution.values.any((v) => v > 0);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0F1A30).withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Tỷ lệ cảnh báo',
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.white.withValues(alpha: 0.9),
            ),
          ),
          const SizedBox(height: 20),
          
          if (_isLoading)
            const SizedBox(
              height: 160,
              child: Center(
                child: CircularProgressIndicator(color: Color(0xFF00A896)),
              ),
            )
          else if (!hasData)
            SizedBox(
              height: 160,
              child: Center(
                child: Text(
                  'Chưa có dữ liệu cảnh báo',
                  style: GoogleFonts.inter(
                    color: Colors.white.withValues(alpha: 0.4),
                    fontSize: 13,
                  ),
                ),
              ),
            )
          else
            Row(
              children: [
                // Pie Chart
                SizedBox(
                  height: 140,
                  width: 140,
                  child: PieChart(
                    PieChartData(
                      sectionsSpace: 4,
                      centerSpaceRadius: 40,
                      sections: _distribution.entries.map((entry) {
                        return PieChartSectionData(
                          color: _getColor(entry.key),
                          value: entry.value.toDouble(),
                          title: '${entry.value}',
                          radius: 30,
                          titleStyle: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
                const SizedBox(width: 24),
                // Legend
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: _distribution.entries.map((entry) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Row(
                          children: [
                            Container(
                              width: 12,
                              height: 12,
                              decoration: BoxDecoration(
                                color: _getColor(entry.key),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                entry.key,
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  color: Colors.white.withValues(alpha: 0.7),
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }
}
