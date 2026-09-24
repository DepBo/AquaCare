class DeviceModel {
  final int id;
  final String macAddress;
  final String firmwareVersion;
  final bool isActive;
  final String createdAt;
  final int? tankId;
  final String? tankName;
  final String? ownerName;
  final String? ownerPhone;

  DeviceModel({
    required this.id,
    required this.macAddress,
    required this.firmwareVersion,
    required this.isActive,
    required this.createdAt,
    this.tankId,
    this.tankName,
    this.ownerName,
    this.ownerPhone,
  });

  factory DeviceModel.fromJson(Map<String, dynamic> json) {
    final tanks = json['tanks'] as Map<String, dynamic>?;
    final users = tanks?['users'] as Map<String, dynamic>?;

    return DeviceModel(
      id: json['id'] as int,
      macAddress: (json['mac_address'] as String? ?? '').trim(),
      firmwareVersion: json['firmware_version'] as String? ?? 'V1',
      isActive: json['is_active'] as bool? ?? false,
      createdAt: json['created_at'] as String? ?? '',
      tankId: json['tank_id'] as int?,
      tankName: tanks?['tank_name'] as String?,
      ownerName: users?['full_name'] as String?,
      ownerPhone: users?['phone'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'mac_address': macAddress,
      'firmware_version': firmwareVersion,
      'is_active': isActive,
      'created_at': createdAt,
      'tank_id': tankId,
    };
  }
}

class BuyerInfo {
  final String orderId;
  final String customerName;
  final String phone;
  final String address;
  final String email;
  final String productName;
  final String createdAt;

  BuyerInfo({
    required this.orderId,
    required this.customerName,
    required this.phone,
    required this.address,
    required this.email,
    required this.productName,
    required this.createdAt,
  });

  factory BuyerInfo.fromJson(Map<String, dynamic> json) {
    return BuyerInfo(
      orderId: json['orderId'] as String? ?? '',
      customerName: json['customerName'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      address: json['address'] as String? ?? '',
      email: json['email'] as String? ?? 'N/A',
      productName: json['productName'] as String? ?? '',
      createdAt: json['createdAt'] as String? ?? '',
    );
  }
}
