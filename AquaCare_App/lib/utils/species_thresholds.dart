/// The same good ranges and warning margins used by the backend for each fish species.
Map<String, List<double>> sensorThresholds(
  String sensorName,
  Map<String, dynamic>? species,
) {
  final (
    minKey,
    maxKey,
    fallbackGood,
    fallbackWarn,
    lowerMargin,
    upperMargin,
  ) = switch (sensorName) {
    'pH' => (
      'ph_min',
      'ph_max',
      <double>[6.5, 7.5],
      <double>[6.0, 8.0],
      0.5,
      0.5,
    ),
    'Nhiệt độ' => (
      'temp_min',
      'temp_max',
      <double>[24.0, 28.0],
      <double>[22.0, 30.0],
      2.0,
      2.0,
    ),
    'TDS' => (
      'tds_min',
      'tds_max',
      <double>[150.0, 300.0],
      <double>[100.0, 400.0],
      50.0,
      100.0,
    ),
    _ => ('', '', <double>[0.0, 100.0], <double>[0.0, 100.0], 0.0, 0.0),
  };

  final min = double.tryParse(species?[minKey]?.toString() ?? '');
  final max = double.tryParse(species?[maxKey]?.toString() ?? '');
  if (min == null ||
      max == null ||
      !min.isFinite ||
      !max.isFinite ||
      min >= max) {
    return {'good': fallbackGood, 'warn': fallbackWarn};
  }
  return {
    'good': [min, max],
    'warn': [min - lowerMargin, max + upperMargin],
  };
}

String statusForReading(
  String sensorName,
  double? value, {
  Map<String, dynamic>? species,
}) {
  if (value == null || !value.isFinite) return 'Chưa có dữ liệu';
  if (sensorName == 'Mực nước') return value == 1 ? 'Ổn định' : 'Cạn nước';
  if (sensorName != 'pH' && sensorName != 'Nhiệt độ' && sensorName != 'TDS') {
    return 'Chưa có dữ liệu';
  }

  final thresholds = sensorThresholds(sensorName, species);
  final good = thresholds['good']!;
  final warn = thresholds['warn']!;
  if (value >= good[0] && value <= good[1]) return 'Tốt';
  if (value >= warn[0] && value <= warn[1]) return 'Cảnh báo';
  return 'Nguy hiểm';
}
