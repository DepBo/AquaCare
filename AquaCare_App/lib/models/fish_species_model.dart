class FishSpecies {
  final int id;
  final String speciesName;
  final double tempMin;
  final double tempMax;
  final double phMin;
  final double phMax;
  final double tdsMin;
  final double tdsMax;
  final DateTime? createdAt;

  FishSpecies({
    required this.id,
    required this.speciesName,
    required this.tempMin,
    required this.tempMax,
    required this.phMin,
    required this.phMax,
    required this.tdsMin,
    required this.tdsMax,
    this.createdAt,
  });

  factory FishSpecies.fromJson(Map<String, dynamic> json) {
    return FishSpecies(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      speciesName: json['species_name'] ?? '',
      tempMin: (json['temp_min'] ?? 24.0).toDouble(),
      tempMax: (json['temp_max'] ?? 30.0).toDouble(),
      phMin: (json['ph_min'] ?? 6.5).toDouble(),
      phMax: (json['ph_max'] ?? 7.5).toDouble(),
      tdsMin: (json['tds_min'] ?? 100.0).toDouble(),
      tdsMax: (json['tds_max'] ?? 300.0).toDouble(),
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at'].toString()) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'species_name': speciesName,
      'temp_min': tempMin,
      'temp_max': tempMax,
      'ph_min': phMin,
      'ph_max': phMax,
      'tds_min': tdsMin,
      'tds_max': tdsMax,
    };
  }
}
