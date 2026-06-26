class SensorReading {
  final DateTime time;
  final double value;

  SensorReading({required this.time, required this.value});

  factory SensorReading.fromJson(Map<String, dynamic> json, String valueKey) {
    return SensorReading(
      time: DateTime.parse(json['created_at']),
      value: (json[valueKey] as num).toDouble(),
    );
  }
}

class AlertItem {
  final String key;
  final String label;
  final double val;
  final String unit;
  final String msg;
  final String level;

  AlertItem({
    required this.key,
    required this.label,
    required this.val,
    required this.unit,
    required this.msg,
    required this.level,
  });
}
