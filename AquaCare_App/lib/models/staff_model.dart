class StaffModel {
  final String id;
  final String fullName;
  final String email;
  final String phone;
  final String role;
  final String createdAt;

  StaffModel({
    required this.id,
    required this.fullName,
    required this.email,
    required this.phone,
    required this.role,
    required this.createdAt,
  });

  static const Map<String, String> roleLabels = {
    'staff_warehouse': 'Nhân viên kho',
    'staff_shipper': 'Nhân viên giao hàng',
    'staff_support': 'Nhân viên hỗ trợ',
    'staff_maintenance': 'Nhân viên bảo trì',
    'staff': 'Staff',
  };

  String get roleLabel => roleLabels[role] ?? 'Staff';

  factory StaffModel.fromJson(Map<String, dynamic> json) {
    return StaffModel(
      id: json['id'] as String? ?? '',
      fullName: json['full_name'] as String? ?? '',
      email: json['email'] as String? ?? 'N/A',
      phone: json['phone'] as String? ?? '',
      role: json['role'] as String? ?? 'staff_warehouse',
      createdAt: json['created_at'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'full_name': fullName,
      'email': email,
      'phone': phone,
      'role': role,
      'created_at': createdAt,
    };
  }
}
