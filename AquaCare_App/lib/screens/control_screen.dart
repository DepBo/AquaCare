import 'package:flutter/material.dart';
import '../customer_theme.dart';
import 'dart:async';
import 'package:google_fonts/google_fonts.dart';
import '../services/supabase_service.dart';

class ControlScreen extends StatefulWidget {
  final String tankId;

  const ControlScreen({super.key, required this.tankId});

  @override
  State<ControlScreen> createState() => _ControlScreenState();
}

class _ControlScreenState extends State<ControlScreen> {
  Stream<Map<String, dynamic>?>? _deviceStream;

  @override
  void initState() {
    super.initState();
    _initStream();
  }

  @override
  void didUpdateWidget(ControlScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.tankId != widget.tankId) {
      _initStream();
    }
  }

  void _initStream() {
    if (widget.tankId.isNotEmpty) {
      _deviceStream = SupabaseService.instance.getDeviceStream(widget.tankId);
    } else {
      _deviceStream = null;
    }
  }

  Future<void> _selectTime(
    BuildContext context,
    String field,
    String? currentTime,
  ) async {
    TimeOfDay initialTime = TimeOfDay.now();
    if (currentTime != null && currentTime.contains(':')) {
      final parts = currentTime.split(':');
      if (parts.length >= 2) {
        initialTime = TimeOfDay(
          hour: int.tryParse(parts[0]) ?? 0,
          minute: int.tryParse(parts[1]) ?? 0,
        );
      }
    }

    final customerTheme = Theme.of(context);
    final picked = await showTimePicker(
      context: context,
      initialTime: initialTime,
      builder: (context, child) {
        return Theme(
          data: customerTheme.copyWith(
            colorScheme: customerTheme.colorScheme.copyWith(
              primary: const Color(0xFF00A896),
              surface: CustomerColors.card,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      final timeStr =
          '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';
      await SupabaseService.instance.updateDeviceSchedule(
        widget.tankId,
        field,
        timeStr,
      );
      if (mounted) {
        final actionName = field.contains('on_time') ? 'giờ bật' : 'giờ tắt';
        _showNotification('Hẹn $actionName thành công!');
      }
    }
  }

  Future<void> _cancelTime(BuildContext context, String field) async {
    await SupabaseService.instance.updateDeviceSchedule(
      widget.tankId,
      field,
      null,
    );
    if (mounted) {
      final actionName = field.contains('on_time') ? 'giờ bật' : 'giờ tắt';
      _showNotification('Hủy $actionName thành công!');
    }
  }

  void _showNotification(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: GoogleFonts.inter(
            color: CustomerColors.text,
            fontWeight: FontWeight.w500,
          ),
        ),
        backgroundColor: Color(0xFF00A896),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(16),
        duration: Duration(seconds: 2),
      ),
    );
  }

  Widget _buildDeviceCard(
    String title,
    IconData icon,
    String relayType,
    Color activeColor,
    Map<String, dynamic> deviceData,
  ) {
    final stateField = 'relay_${relayType}_state';
    final onTimeField = '${relayType}_on_time';
    final offTimeField = '${relayType}_off_time';

    final bool isOn = deviceData[stateField] == true;
    final String onTime = deviceData[onTimeField] ?? '--:--';
    final String offTime = deviceData[offTimeField] ?? '--:--';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: CustomerColors.card.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isOn
              ? activeColor.withValues(alpha: 0.3)
              : CustomerColors.border,
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: isOn
                      ? activeColor.withValues(alpha: 0.15)
                      : CustomerColors.text.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  icon,
                  color: isOn ? activeColor : CustomerColors.secondaryText,
                  size: 24,
                ),
              ),
              SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.inter(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: isOn
                            ? CustomerColors.text
                            : CustomerColors.text.withValues(alpha: 0.7),
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      isOn ? 'Đang hoạt động' : 'Đã tắt',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: isOn
                            ? activeColor
                            : CustomerColors.secondaryText,
                      ),
                    ),
                  ],
                ),
              ),
              Switch(
                value: isOn,
                activeThumbColor: activeColor,
                activeTrackColor: activeColor.withValues(alpha: 0.3),
                inactiveThumbColor: CustomerColors.text.withValues(alpha: 0.6),
                inactiveTrackColor: CustomerColors.text.withValues(alpha: 0.1),
                onChanged: (val) {
                  SupabaseService.instance.updateRelayState(
                    widget.tankId,
                    relayType,
                    val,
                  );
                },
              ),
            ],
          ),
          SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildTimeSetting(
                  'Giờ Bật',
                  onTime,
                  Icons.play_circle_outline,
                  () => _selectTime(context, onTimeField, onTime),
                  onTime != '--:--'
                      ? () => _cancelTime(context, onTimeField)
                      : null,
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: _buildTimeSetting(
                  'Giờ Tắt',
                  offTime,
                  Icons.stop_circle_outlined,
                  () => _selectTime(context, offTimeField, offTime),
                  offTime != '--:--'
                      ? () => _cancelTime(context, offTimeField)
                      : null,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimeSetting(
    String label,
    String time,
    IconData icon,
    VoidCallback onTap,
    VoidCallback? onCancel,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: CustomerColors.text.withValues(alpha: 0.03),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: CustomerColors.border),
        ),
        child: Row(
          children: [
            Icon(icon, size: 16, color: CustomerColors.secondaryText),
            SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      color: CustomerColors.secondaryText,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    time,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: time != '--:--'
                          ? CustomerColors.text
                          : CustomerColors.mutedText,
                    ),
                  ),
                ],
              ),
            ),
            if (onCancel != null)
              GestureDetector(
                onTap: onCancel,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.red.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.close, size: 14, color: Colors.redAccent),
                ),
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.tankId.isEmpty) return const SizedBox.shrink();

    return StreamBuilder<Map<String, dynamic>?>(
      stream: _deviceStream,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(
            child: CircularProgressIndicator(color: Color(0xFF00A896)),
          );
        }

        final deviceData = snapshot.data;
        if (deviceData == null) {
          return Center(
            child: Text(
              'Không có dữ liệu thiết bị',
              style: GoogleFonts.inter(color: CustomerColors.secondaryText),
            ),
          );
        }

        return SingleChildScrollView(
          padding: EdgeInsets.fromLTRB(
            16,
            20,
            16,
            96 + MediaQuery.paddingOf(context).bottom,
          ),
          child: Column(
            children: [
              _buildDeviceCard(
                'Máy bơm nước',
                Icons.water_drop,
                'pump',
                Color(0xFF00A896),
                deviceData,
              ),
              _buildDeviceCard(
                'Đèn thủy sinh',
                Icons.lightbulb_outline,
                'light',
                Color(0xFFFFD93D),
                deviceData,
              ),
              _buildDeviceCard(
                'Máy sục oxy',
                Icons.air,
                'aerator',
                Color(0xFF4DA6FF),
                deviceData,
              ),
            ],
          ),
        );
      },
    );
  }
}
