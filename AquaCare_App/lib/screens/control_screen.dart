import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../customer_theme.dart';
import '../services/supabase_service.dart';

class ControlScreen extends StatefulWidget {
  final String tankId;

  const ControlScreen({super.key, required this.tankId});

  @override
  State<ControlScreen> createState() => _ControlScreenState();
}

class _ControlScreenState extends State<ControlScreen> {
  Stream<Map<String, dynamic>?>? _deviceStream;
  Stream<List<Map<String, dynamic>>>? _scheduleStream;
  int? _scheduleDeviceId;
  bool _updatingDeviceActive = false;

  @override
  void initState() {
    super.initState();
    _initStream();
  }

  @override
  void didUpdateWidget(ControlScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.tankId != widget.tankId) _initStream();
  }

  void _initStream() {
    _deviceStream = widget.tankId.isEmpty
        ? null
        : SupabaseService.instance.getDeviceStream(widget.tankId);
    _scheduleStream = null;
    _scheduleDeviceId = null;
  }

  Stream<List<Map<String, dynamic>>> _schedulesFor(int deviceId) {
    if (_scheduleDeviceId != deviceId || _scheduleStream == null) {
      _scheduleDeviceId = deviceId;
      _scheduleStream = SupabaseService.instance.getDeviceSchedulesStream(
        deviceId,
      );
    }
    return _scheduleStream!;
  }

  String _timeText(dynamic value) {
    if (value == null) return '--:--';
    final time = value.toString();
    return time.length >= 5 ? time.substring(0, 5) : '--:--';
  }

  String _localDate(DateTime date) =>
      '${date.year.toString().padLeft(4, '0')}-'
      '${date.month.toString().padLeft(2, '0')}-'
      '${date.day.toString().padLeft(2, '0')}';

  DateTime _dateTime(String date, String time) =>
      DateTime.parse('${date}T$time:00');

  String? _validateSchedule(
    String? onTime,
    String? offTime,
    bool isDaily,
    String? runDate,
  ) {
    if (onTime == null && offTime == null) {
      return 'Chọn ít nhất một giờ bật hoặc tắt.';
    }
    if (isDaily) return null;
    if (runDate == null) return 'Chọn ngày chạy lịch.';

    final now = DateTime.now().subtract(const Duration(minutes: 2));
    if (onTime != null && _dateTime(runDate, onTime).isBefore(now)) {
      return 'Giờ bật một lần đã qua. Hãy chọn thời gian mới.';
    }
    if (offTime != null) {
      var offAt = _dateTime(runDate, offTime);
      if (onTime != null && offTime.compareTo(onTime) <= 0) {
        offAt = offAt.add(const Duration(days: 1));
      }
      if (offAt.isBefore(now)) {
        return 'Giờ tắt một lần đã qua. Hãy chọn thời gian mới.';
      }
    }
    return null;
  }

  void _showNotification(String message, {bool error = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: GoogleFonts.inter(color: Colors.white)),
        backgroundColor: error
            ? const Color(0xFFB54747)
            : const Color(0xFF008F82),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Future<void> _setDeviceActive(int deviceId, bool isActive) async {
    if (_updatingDeviceActive) return;
    final tankId = widget.tankId;
    setState(() => _updatingDeviceActive = true);
    try {
      await SupabaseService.instance.setDeviceActive(tankId, deviceId, isActive);
      if (!mounted || widget.tankId != tankId) return;
      setState(_initStream);
      _showNotification(isActive ? 'Đã bật thiết bị.' : 'Đã tắt thiết bị.');
    } catch (error) {
      _showNotification('Không thể đổi trạng thái thiết bị. Vui lòng thử lại.', error: true);
    } finally {
      if (mounted) setState(() => _updatingDeviceActive = false);
    }
  }

  Future<void> _editSchedule(
    int deviceId,
    String relayName,
    Map<String, dynamic>? schedule,
  ) async {
    String? onTime = schedule?['on_time'] == null
        ? null
        : _timeText(schedule!['on_time']);
    String? offTime = schedule?['off_time'] == null
        ? null
        : _timeText(schedule!['off_time']);
    var isDaily = schedule?['is_daily'] == true;
    String? runDate =
        schedule?['run_date']?.toString() ?? _localDate(DateTime.now());
    var saving = false;
    String? validationError;

    final outcome = await showDialog<String>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) {
          Future<void> pickTime(bool isOn) async {
            final current = isOn ? onTime : offTime;
            final parts = current?.split(':');
            final picked = await showTimePicker(
              context: dialogContext,
              initialTime: parts != null && parts.length == 2
                  ? TimeOfDay(
                      hour: int.parse(parts[0]),
                      minute: int.parse(parts[1]),
                    )
                  : TimeOfDay.now(),
            );
            if (picked == null || !dialogContext.mounted) return;
            final value =
                '${picked.hour.toString().padLeft(2, '0')}:'
                '${picked.minute.toString().padLeft(2, '0')}';
            setDialogState(() {
              if (isOn) {
                onTime = value;
              } else {
                offTime = value;
              }
              validationError = null;
            });
          }

          Future<void> pickDate() async {
            final selected = DateTime.tryParse(runDate ?? '') ?? DateTime.now();
            final picked = await showDatePicker(
              context: dialogContext,
              initialDate: selected,
              firstDate: DateTime(2020),
              lastDate: DateTime.now().add(const Duration(days: 3650)),
            );
            if (picked != null && dialogContext.mounted) {
              setDialogState(() {
                runDate = _localDate(picked);
                validationError = null;
              });
            }
          }

          Future<void> save() async {
            final issue = _validateSchedule(onTime, offTime, isDaily, runDate);
            if (issue != null) {
              setDialogState(() => validationError = issue);
              return;
            }
            setDialogState(() {
              saving = true;
              validationError = null;
            });
            try {
              await SupabaseService.instance.saveDeviceSchedule(
                deviceId: deviceId,
                relayName: relayName,
                onTime: onTime,
                offTime: offTime,
                isDaily: isDaily,
                runDate: runDate,
                existingId: (schedule?['id'] as num?)?.toInt(),
              );
              if (dialogContext.mounted) Navigator.pop(dialogContext, 'saved');
            } catch (error) {
              if (dialogContext.mounted) {
                setDialogState(
                  () => validationError = 'Không lưu được lịch: $error',
                );
              }
            } finally {
              if (dialogContext.mounted) setDialogState(() => saving = false);
            }
          }

          Future<void> cancelSchedule() async {
            setDialogState(() {
              saving = true;
              validationError = null;
            });
            try {
              await SupabaseService.instance.cancelDeviceSchedule(
                deviceId: deviceId,
                scheduleId: (schedule!['id'] as num).toInt(),
              );
              if (dialogContext.mounted) {
                Navigator.pop(dialogContext, 'canceled');
              }
            } catch (error) {
              if (dialogContext.mounted) {
                setDialogState(
                  () => validationError = 'Không hủy được lịch: $error',
                );
              }
            } finally {
              if (dialogContext.mounted) setDialogState(() => saving = false);
            }
          }

          return AlertDialog(
            backgroundColor: CustomerColors.card,
            title: Text(
              'Hẹn giờ ${_relayTitle(relayName)}',
              style: GoogleFonts.inter(
                color: CustomerColors.text,
                fontSize: 18,
              ),
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Kiểu lịch',
                    style: GoogleFonts.inter(color: CustomerColors.text),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: [
                      ChoiceChip(
                        label: const Text('Một lần'),
                        selected: !isDaily,
                        onSelected: saving
                            ? null
                            : (_) => setDialogState(() => isDaily = false),
                      ),
                      ChoiceChip(
                        label: const Text('Hằng ngày'),
                        selected: isDaily,
                        onSelected: saving
                            ? null
                            : (_) => setDialogState(() => isDaily = true),
                      ),
                    ],
                  ),
                  if (!isDaily) ...[
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: saving ? null : pickDate,
                      child: Text('Ngày chạy: $runDate'),
                    ),
                  ],
                  const SizedBox(height: 12),
                  _timeInput(
                    'Giờ bật',
                    onTime,
                    saving,
                    () => pickTime(true),
                    () => setDialogState(() => onTime = null),
                  ),
                  const SizedBox(height: 8),
                  _timeInput(
                    'Giờ tắt',
                    offTime,
                    saving,
                    () => pickTime(false),
                    () => setDialogState(() => offTime = null),
                  ),
                  if (validationError != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      validationError!,
                      style: GoogleFonts.inter(
                        color: const Color(0xFFFF7777),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            actions: [
              if (schedule != null)
                TextButton(
                  onPressed: saving ? null : cancelSchedule,
                  child: const Text('Hủy lịch'),
                ),
              TextButton(
                onPressed: saving ? null : () => Navigator.pop(dialogContext),
                child: const Text('Đóng'),
              ),
              FilledButton(
                onPressed: saving ? null : save,
                child: Text(saving ? 'Đang lưu...' : 'Lưu lịch'),
              ),
            ],
          );
        },
      ),
    );

    if (!mounted || outcome == null) return;
    setState(() {
      _scheduleStream = null;
      _scheduleDeviceId = null;
    });
    if (outcome == 'saved') _showNotification('Đã lưu lịch thiết bị.');
    if (outcome == 'canceled') _showNotification('Đã hủy lịch thiết bị.');
  }

  String _relayTitle(String relayName) => switch (relayName) {
    'Pump' => 'máy bơm',
    'Light' => 'đèn thủy sinh',
    _ => 'máy sục oxy',
  };

  Widget _timeInput(
    String label,
    String? value,
    bool saving,
    VoidCallback onPick,
    VoidCallback onClear,
  ) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: saving ? null : onPick,
            child: Text('$label: ${value ?? '--:--'}'),
          ),
        ),
        if (value != null)
          TextButton(
            onPressed: saving ? null : onClear,
            child: const Text('Xóa'),
          ),
      ],
    );
  }

  Widget _buildDeviceCard(
    String title,
    IconData icon,
    String relayType,
    String relayName,
    Color activeColor,
    Map<String, dynamic> deviceData,
    Map<String, dynamic>? schedule,
  ) {
    final isOn = deviceData['relay_${relayType}_state'] == true;
    final onTime = _timeText(schedule?['on_time']);
    final offTime = _timeText(schedule?['off_time']);
    final dateText = schedule == null
        ? 'Chưa có lịch'
        : schedule['is_daily'] == true
        ? 'Lặp lại hằng ngày'
        : 'Một lần · ${schedule['run_date']}';

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
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                width: 46,
                height: 46,
                alignment: Alignment.center,
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
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.inter(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: CustomerColors.text,
                      ),
                    ),
                    const SizedBox(height: 4),
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
                onChanged: (value) => SupabaseService.instance.updateRelayState(
                  widget.tankId,
                  relayType,
                  value,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            dateText,
            style: GoogleFonts.inter(
              fontSize: 12,
              color: CustomerColors.secondaryText,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: Text(
                  'Bật: $onTime',
                  style: GoogleFonts.inter(
                    color: CustomerColors.text,
                    fontSize: 13,
                  ),
                ),
              ),
              Expanded(
                child: Text(
                  'Tắt: $offTime',
                  style: GoogleFonts.inter(
                    color: CustomerColors.text,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: () => _editSchedule(
              (deviceData['id'] as num).toInt(),
              relayName,
              schedule,
            ),
            child: Text(schedule == null ? 'Thêm lịch' : 'Sửa hoặc hủy lịch'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.tankId.isEmpty) return const SizedBox.shrink();

    return StreamBuilder<Map<String, dynamic>?>(
      stream: _deviceStream,
      builder: (context, deviceSnapshot) {
        if (deviceSnapshot.hasError) {
          return Center(
            child: Text('Không tải được thiết bị: ${deviceSnapshot.error}'),
          );
        }
        if (deviceSnapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        final device = deviceSnapshot.data;
        if (device == null) {
          return Center(
            child: Text(
              'Không có dữ liệu thiết bị',
              style: GoogleFonts.inter(color: CustomerColors.secondaryText),
            ),
          );
        }
        final deviceId = (device['id'] as num).toInt();

        return StreamBuilder<List<Map<String, dynamic>>>(
          stream: _schedulesFor(deviceId),
          builder: (context, scheduleSnapshot) {
            if (scheduleSnapshot.hasError) {
              return Center(
                child: Text('Không tải được lịch: ${scheduleSnapshot.error}'),
              );
            }
            if (scheduleSnapshot.connectionState == ConnectionState.waiting &&
                !scheduleSnapshot.hasData) {
              return const Center(child: CircularProgressIndicator());
            }
            final schedules = {
              for (final row
                  in scheduleSnapshot.data ?? <Map<String, dynamic>>[])
                row['relay_name'] as String: row,
            };

            return SingleChildScrollView(
              padding: EdgeInsets.fromLTRB(
                16,
                20,
                16,
                96 + MediaQuery.paddingOf(context).bottom,
              ),
              child: Column(
                children: [
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: CustomerColors.card,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: CustomerColors.border),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Thiết bị của bể', style: GoogleFonts.inter(
                                fontSize: 15, fontWeight: FontWeight.w600,
                                color: CustomerColors.text,
                              )),
                              const SizedBox(height: 4),
                              Text(device['is_active'] == true
                                  ? 'Đang bật · simulator sẽ ghi dữ liệu'
                                  : 'Đã tắt · simulator ngừng ghi dữ liệu',
                                style: GoogleFonts.inter(
                                  fontSize: 12, color: CustomerColors.secondaryText,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Switch(
                          value: device['is_active'] == true,
                          activeThumbColor: const Color(0xFF00A896),
                          onChanged: _updatingDeviceActive
                              ? null
                              : (value) => _setDeviceActive(deviceId, value),
                        ),
                      ],
                    ),
                  ),
                  _buildDeviceCard(
                    'Máy bơm nước',
                    Icons.water_drop,
                    'pump',
                    'Pump',
                    const Color(0xFF00A896),
                    device,
                    schedules['Pump'],
                  ),
                  _buildDeviceCard(
                    'Đèn thủy sinh',
                    Icons.lightbulb_outline,
                    'light',
                    'Light',
                    const Color(0xFFFFD93D),
                    device,
                    schedules['Light'],
                  ),
                  _buildDeviceCard(
                    'Máy sục oxy',
                    Icons.air,
                    'aerator',
                    'Aerator',
                    const Color(0xFF4DA6FF),
                    device,
                    schedules['Aerator'],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
