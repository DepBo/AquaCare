class Pond {
  final String id;
  final String name;
  final int volume;
  final int? speciesId;
  final String? macAddress;
  final String? lastCalibPh;

  Pond({
    required this.id,
    required this.name,
    required this.volume,
    this.speciesId,
    this.macAddress,
    this.lastCalibPh,
  });

  factory Pond.fromJson(Map<String, dynamic> json) {
    return Pond(
      id: json['id'],
      name: json['name'],
      volume: json['volume'],
      speciesId: json['species_id'],
      macAddress: json['mac_address'],
      lastCalibPh: json['last_calib_ph'],
    );
  }
}
