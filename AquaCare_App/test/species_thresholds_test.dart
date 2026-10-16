import 'package:flutter_test/flutter_test.dart';
import 'package:aquacare_app/utils/species_thresholds.dart';

void main() {
  const koi = <String, dynamic>{
    'temp_min': 18,
    'temp_max': 26,
    'ph_min': 7,
    'ph_max': 8.5,
    'tds_min': 150,
    'tds_max': 400,
  };

  test('Koi temperature uses the species range and backend warning margin', () {
    expect(sensorThresholds('Nhiệt độ', koi)['good'], [18, 26]);
    expect(sensorThresholds('Nhiệt độ', koi)['warn'], [16, 28]);
    expect(statusForReading('Nhiệt độ', 22.6, species: koi), 'Tốt');
    expect(statusForReading('Nhiệt độ', 26, species: koi), 'Tốt');
    expect(statusForReading('Nhiệt độ', 27, species: koi), 'Cảnh báo');
    expect(statusForReading('Nhiệt độ', 28.1, species: koi), 'Nguy hiểm');
  });

  test('other sensors use their species thresholds too', () {
    expect(statusForReading('pH', 7.04, species: koi), 'Tốt');
    expect(statusForReading('pH', 6.7, species: koi), 'Cảnh báo');
    expect(statusForReading('TDS', 200, species: koi), 'Tốt');
    expect(statusForReading('TDS', 420, species: koi), 'Cảnh báo');
  });

  test('missing species preserves backend defaults', () {
    expect(statusForReading('Nhiệt độ', 22.6), 'Cảnh báo');
    expect(statusForReading('Mực nước', 1), 'Ổn định');
  });
}
