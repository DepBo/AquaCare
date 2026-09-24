class SubscriptionPlanModel {
  final dynamic id;
  final String name;
  final String planType; // free, premium, enterprise
  final double price;
  final int durationMonths;
  final int maxTanks;
  final bool smartDeviceSetup;
  final int historyDays;
  final DateTime? createdAt;

  SubscriptionPlanModel({
    required this.id,
    required this.name,
    required this.planType,
    required this.price,
    required this.durationMonths,
    required this.maxTanks,
    required this.smartDeviceSetup,
    required this.historyDays,
    this.createdAt,
  });

  String get planTypeLabel {
    switch (planType) {
      case 'free':
        return 'Miễn phí';
      case 'premium':
        return 'Cao cấp';
      case 'enterprise':
        return 'Doanh nghiệp';
      default:
        return planType;
    }
  }

  factory SubscriptionPlanModel.fromJson(Map<String, dynamic> json) {
    return SubscriptionPlanModel(
      id: json['id'],
      name: json['name'] ?? '',
      planType: json['plan_type'] ?? 'free',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      durationMonths: (json['duration_months'] as num?)?.toInt() ?? 1,
      maxTanks: (json['max_tanks'] as num?)?.toInt() ?? 1,
      smartDeviceSetup: json['smart_device_setup'] ?? false,
      historyDays: (json['history_days'] as num?)?.toInt() ?? 30,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'plan_type': planType,
      'price': price,
      'duration_months': durationMonths,
      'max_tanks': maxTanks,
      'smart_device_setup': smartDeviceSetup,
      'history_days': historyDays,
    };
  }
}
