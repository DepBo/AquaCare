import 'package:aquacare_app/utils/species_thresholds.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  const species = <String, dynamic>{
    'ph_min': 7,
    'ph_max': 8,
    'temp_min': 18,
    'temp_max': 26,
    'tds_min': 150,
    'tds_max': 400,
  };

  test('pH good-range endpoints are inclusive', () {
    expect(statusForReading('pH', 7, species: species), 'Tốt');
    expect(statusForReading('pH', 8, species: species), 'Tốt');
  });

  test('pH warning endpoints are inclusive and outside is dangerous', () {
    expect(statusForReading('pH', 6.5, species: species), 'Cảnh báo');
    expect(statusForReading('pH', 8.5, species: species), 'Cảnh báo');
    expect(statusForReading('pH', 6.49, species: species), 'Nguy hiểm');
    expect(statusForReading('pH', 8.51, species: species), 'Nguy hiểm');
  });

  test('temperature warning margin uses species limits on both sides', () {
    expect(statusForReading('Nhiệt độ', 16, species: species), 'Cảnh báo');
    expect(statusForReading('Nhiệt độ', 28, species: species), 'Cảnh báo');
    expect(statusForReading('Nhiệt độ', 15.9, species: species), 'Nguy hiểm');
    expect(statusForReading('Nhiệt độ', 28.1, species: species), 'Nguy hiểm');
  });

  test('TDS warning margin differs below and above the species range', () {
    expect(statusForReading('TDS', 100, species: species), 'Cảnh báo');
    expect(statusForReading('TDS', 500, species: species), 'Cảnh báo');
    expect(statusForReading('TDS', 99.9, species: species), 'Nguy hiểm');
    expect(statusForReading('TDS', 500.1, species: species), 'Nguy hiểm');
  });

  test('missing and non-finite measurements never become a healthy reading', () {
    expect(statusForReading('pH', null, species: species), 'Chưa có dữ liệu');
    expect(statusForReading('pH', double.nan, species: species), 'Chưa có dữ liệu');
    expect(statusForReading('TDS', double.infinity, species: species), 'Chưa có dữ liệu');
  });

  test('invalid species limits fall back to the configured defaults', () {
    final invalid = {...species, 'temp_min': 30, 'temp_max': 20};
    expect(sensorThresholds('Nhiệt độ', invalid)['good'], [24, 28]);
    expect(statusForReading('Nhiệt độ', 26, species: invalid), 'Tốt');
  });

  test('water level distinguishes full and empty without species settings', () {
    expect(statusForReading('Mực nước', 1), 'Ổn định');
    expect(statusForReading('Mực nước', 0), 'Cạn nước');
    expect(statusForReading('Mực nước', null), 'Chưa có dữ liệu');
  });
}
