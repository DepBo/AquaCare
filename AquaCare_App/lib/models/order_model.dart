class OrderItemModel {
  final String productName;
  final int quantity;
  final double price;
  final List<String> deviceMacs;

  OrderItemModel({
    required this.productName,
    required this.quantity,
    required this.price,
    required this.deviceMacs,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    List<String> macs = [];
    if (json['device_macs'] != null && json['device_macs'] is List) {
      macs = (json['device_macs'] as List).map((e) => e.toString()).toList();
    }
    return OrderItemModel(
      productName: json['product_name'] ?? 'N/A',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      deviceMacs: macs,
    );
  }
}

class OrderModel {
  final String id;
  final String userId;
  final String customerName;
  final String phone;
  final String email;
  final String address;
  final String note;
  final double totalPrice;
  final String paymentMethod;
  final String status;
  final DateTime createdAt;
  final List<OrderItemModel> items;

  OrderModel({
    required this.id,
    required this.userId,
    required this.customerName,
    required this.phone,
    required this.email,
    required this.address,
    required this.note,
    required this.totalPrice,
    required this.paymentMethod,
    required this.status,
    required this.createdAt,
    required this.items,
  });

  String get productSummary {
    if (items.isEmpty) return 'N/A';
    return items.map((i) => i.productName).join(', ');
  }

  String get macsSummary {
    final allMacs = items.expand((i) => i.deviceMacs).toList();
    if (allMacs.isEmpty) return '';
    return allMacs.join(', ');
  }

  int get totalQuantity {
    if (items.isEmpty) return 1;
    return items.fold(0, (sum, item) => sum + item.quantity);
  }

  String get statusLabel {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'confirmed':
      case 'approved':
        return 'Đã duyệt';
      case 'shipping':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    List<OrderItemModel> parsedItems = [];
    if (json['order_items'] != null && json['order_items'] is List) {
      parsedItems = (json['order_items'] as List)
          .map((itemJson) => OrderItemModel.fromJson(itemJson as Map<String, dynamic>))
          .toList();
    }
    return OrderModel(
      id: json['id']?.toString() ?? '',
      userId: json['user_id']?.toString() ?? '',
      customerName: json['shipping_name'] ?? 'Khách hàng',
      phone: json['shipping_phone'] ?? '',
      email: json['shipping_email'] ?? 'N/A',
      address: json['shipping_address'] ?? '',
      note: json['note'] ?? json['customer_note'] ?? '',
      totalPrice: (json['total_price'] as num?)?.toDouble() ?? 0.0,
      paymentMethod: json['payment_method'] == 'transfer' ? 'Chuyển khoản' : 'COD',
      status: json['status'] ?? 'pending',
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
      items: parsedItems,
    );
  }
}
