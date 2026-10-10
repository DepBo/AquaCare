import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';

class AdminDashboardPreview extends StatefulWidget {
  const AdminDashboardPreview({
    super.key,
    required this.isDark,
    required this.onNavigate,
  });

  final bool isDark;
  final ValueChanged<int> onNavigate;

  @override
  State<AdminDashboardPreview> createState() => _AdminDashboardPreviewState();
}

class _AdminDashboardPreviewState extends State<AdminDashboardPreview> {
  static const _productionEndpoint =
      'https://aquacare-p78r.onrender.com/api/admin/dashboard';
  static const _debugEndpointOverride =
      String.fromEnvironment('ADMIN_DASHBOARD_API_URL');
  Uri get _endpoint {
    if (kDebugMode && _debugEndpointOverride.isNotEmpty) {
      return Uri.parse(_debugEndpointOverride);
    }
    if (kDebugMode && defaultTargetPlatform == TargetPlatform.android) {
      return Uri.parse('http://10.0.2.2:5000/api/admin/dashboard');
    }
    return Uri.parse(_productionEndpoint);
  }
  Map<String, dynamic>? _data;
  String? _error;
  bool _loading = true;
  bool _show30Days = false;

  Color get _text =>
      widget.isDark ? const Color(0xFFF4F4F5) : const Color(0xFF0F172A);
  Color get _muted =>
      widget.isDark ? const Color(0xFFA1A1AA) : const Color(0xFF64748B);
  Color get _card => widget.isDark ? const Color(0xFF1F1F1F) : Colors.white;
  Color get _border =>
      widget.isDark ? const Color(0xFF333333) : const Color(0xFFDCE5EB);

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final token = Supabase.instance.client.auth.currentSession?.accessToken;
      if (token == null) {
        throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      final response = await http.get(
        _endpoint,
        headers: {'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds: 60));
      if (response.statusCode == 401 || response.statusCode == 403) {
        throw Exception('Không thể xác thực quyền admin. Vui lòng đăng nhập lại.');
      }
      if (response.statusCode != 200) {
        throw Exception('Không tải được dữ liệu tổng quan (HTTP ${response.statusCode}).');
      }
      final data = jsonDecode(response.body);
      if (data is! Map<String, dynamic>) {
        throw Exception('Dữ liệu tổng quan không hợp lệ.');
      }
      if (mounted) setState(() => _data = data);
    } catch (error) {
      if (mounted) {
        setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Map<String, dynamic> _map(dynamic value) =>
      value is Map<String, dynamic> ? value : const {};
  int _number(dynamic value) => value is num ? value.round() : 0;
  String _money(dynamic value) {
    final digits = _number(value).toString();
    return '${digits.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => '.')} ₫';
  }
  DateTime? _date(dynamic value) => DateTime.tryParse(value?.toString() ?? '');
  String _dateLabel(dynamic value) {
    final date = _date(value);
    if (date == null) return '—';
    final vietnamDate = value.toString().contains('T')
        ? date.toUtc().add(const Duration(hours: 7))
        : date;
    final day = vietnamDate.day.toString().padLeft(2, '0');
    final month = vietnamDate.month.toString().padLeft(2, '0');
    return '$day/$month';
  }

  TextStyle _style(double size, Color color,
          [FontWeight weight = FontWeight.w400, double spacing = 0]) =>
      TextStyle(
        fontSize: size,
        color: color,
        fontWeight: weight,
        letterSpacing: spacing,
      );

  Widget _surface({required Widget child}) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: _card,
          border: Border.all(color: _border),
          borderRadius: BorderRadius.circular(18),
        ),
        child: child,
      );

  @override
  Widget build(BuildContext context) {
    if (_data == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (_loading) const CircularProgressIndicator(),
              const SizedBox(height: 14),
              Text(
                _loading ? 'Đang tải tổng quan...' : (_error ?? 'Không có dữ liệu'),
                textAlign: TextAlign.center,
                style: _style(14, _muted),
              ),
              if (!_loading)
                TextButton.icon(
                  onPressed: _load,
                  icon: const Icon(Icons.refresh_rounded),
                  label: const Text('Thử lại'),
                ),
            ],
          ),
        ),
      );
    }

    final data = _data!;
    final revenue = _map(data['revenue']);
    final orders = _map(data['orders']);
    final devices = _map(data['devices']);
    final staff = _map(data['staff']);
    return RefreshIndicator(
      onRefresh: _load,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(18, 20, 18, 120),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('TRUNG TÂM QUẢN TRỊ',
                style: _style(11, const Color(0xFF0284C7), FontWeight.w800, 1.5)),
            const SizedBox(height: 6),
            Text('Tổng quan AquaCare', style: _style(25, _text, FontWeight.w800)),
            const SizedBox(height: 4),
            Text('Theo dõi kinh doanh và hoạt động vận hành.',
                style: _style(13, _muted)),
            const SizedBox(height: 8),
            TextButton.icon(
              onPressed: _loading ? null : _load,
              icon: Icon(_loading ? Icons.hourglass_top_rounded : Icons.refresh_rounded,
                  size: 17),
              label: Text(_loading ? 'Đang cập nhật' : 'Cập nhật dữ liệu'),
            ),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(_error!, style: _style(12, Colors.redAccent)),
              ),
            _revenueCard(revenue),
            const SizedBox(height: 14),
            Row(children: [
              Expanded(child: _metric('Đơn chờ duyệt', '${_number(orders['pending'])}',
                  'Cần kiểm tra', Icons.schedule_rounded,
                  const Color(0xFFE9A53A), () => widget.onNavigate(3))),
              const SizedBox(width: 12),
              Expanded(child: _metric('Đơn đã giao', '${_number(orders['deliveredMonth'])}',
                  'Trong tháng', Icons.check_circle_outline_rounded,
                  const Color(0xFF24AE85), () => widget.onNavigate(3))),
            ]),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: _metric('Thiết bị đã cấp', '${_number(devices['assigned'])}',
                  'Gắn với bể', Icons.inventory_2_outlined,
                  const Color(0xFF35A6DD), () => widget.onNavigate(1))),
              const SizedBox(width: 12),
              Expanded(child: _metric('Nhân viên', '${_number(staff['total'])}',
                  'Trong hệ thống', Icons.people_alt_outlined,
                  const Color(0xFF9976D8), () => widget.onNavigate(2))),
            ]),
            const SizedBox(height: 20),
            _salesChart(revenue),
            const SizedBox(height: 14),
            _orderProgress(orders),
            const SizedBox(height: 14),
            _recentOrders(data['recentOrders']),
            const SizedBox(height: 14),
            _shortcuts(),
          ],
        ),
      ),
    );
  }

  Widget _revenueCard(Map<String, dynamic> revenue) {
    final current = _number(revenue['currentMonth']);
    final previous = _number(revenue['previousMonth']);
    final max = current > previous ? current : previous;
    final change = revenue['changePercent'];
    final changeValue = change is num ? change.toDouble() : null;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(19),
        gradient: const LinearGradient(
          begin: Alignment.topLeft, end: Alignment.bottomRight,
          colors: [Color(0xFF103B60), Color(0xFF03659B), Color(0xFF0696B7)],
        ),
        boxShadow: [BoxShadow(
          color: const Color(0xFF0284C7).withValues(alpha: .16),
          blurRadius: 22, offset: const Offset(0, 9),
        )],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            width: 38, height: 38,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: .16),
              borderRadius: BorderRadius.circular(11),
            ),
            child: const Icon(Icons.account_balance_wallet_outlined,
                color: Colors.white, size: 22),
          ),
          const SizedBox(width: 11),
          Text('DOANH THU',
              style: _style(11, const Color(0xFFD8F7FF), FontWeight.w800, 1.2)),
        ]),
        const SizedBox(height: 18),
        FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerLeft,
          child: Text(_money(current), style: _style(32, Colors.white, FontWeight.w800)),
        ),
        const SizedBox(height: 7),
        Text('Giá trị đơn đã giao trong tháng',
            style: _style(12, const Color(0xFFD2ECF7))),
        const SizedBox(height: 9),
        Text(
          changeValue == null
              ? 'Chưa có số liệu tháng trước'
              : '${changeValue > 0 ? '+' : ''}${changeValue.toStringAsFixed(1).replaceAll('.', ',')}% so với tháng trước',
          style: _style(12,
              changeValue != null && changeValue < 0
                  ? const Color(0xFFFFE2D6)
                  : const Color(0xFFCBFFDC), FontWeight.w700),
        ),
        const SizedBox(height: 20),
        Row(children: [
          Expanded(child: _revenueStat('Đơn đã giao',
              '${_number(revenue['deliveredMonth'])}')),
          const SizedBox(width: 10),
          Expanded(child: _revenueStat('Trung bình / đơn',
              _money(revenue['averageOrder']))),
        ]),
        const SizedBox(height: 15),
        _compareBar('Tháng trước', previous, max, Colors.white70),
        const SizedBox(height: 8),
        _compareBar('Tháng này', current, max, const Color(0xFFA9F7E9)),
        const SizedBox(height: 12),
        Text('Theo ngày tạo đơn · chưa đối soát thanh toán',
            style: _style(10, const Color(0xFFBEE4F1))),
      ]),
    );
  }

  Widget _revenueStat(String label, String value) => Container(
    padding: const EdgeInsets.all(11),
    decoration: BoxDecoration(
      color: Colors.white.withValues(alpha: .10),
      border: Border.all(color: Colors.white.withValues(alpha: .18)),
      borderRadius: BorderRadius.circular(12),
    ),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: _style(10, const Color(0xFFD6EFF8))),
      const SizedBox(height: 4),
      FittedBox(fit: BoxFit.scaleDown, alignment: Alignment.centerLeft,
          child: Text(value, style: _style(15, Colors.white, FontWeight.w800))),
    ]),
  );

  Widget _compareBar(String label, int value, int max, Color color) =>
      Row(children: [
        SizedBox(width: 76, child: Text(label,
            style: _style(10, const Color(0xFFD6EFF8)))),
        Expanded(child: LayoutBuilder(builder: (context, constraints) {
          return ClipRRect(
            borderRadius: BorderRadius.circular(5),
            child: SizedBox(height: 6, child: Stack(children: [
              Positioned.fill(child: ColoredBox(
                color: Colors.white.withValues(alpha: .16),
              )),
              SizedBox(
                width: constraints.maxWidth * (max == 0 ? 0 : value / max),
                height: 6,
                child: ColoredBox(color: color),
              ),
            ])),
          );
        })),
      ]);

  Widget _metric(String label, String value, String caption, IconData icon,
      Color accent, VoidCallback onTap) => Material(
        color: _card,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: _border),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(15),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Container(
                width: 35, height: 35,
                decoration: BoxDecoration(
                  color: accent.withValues(alpha: .13),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 20, color: accent),
              ),
              const SizedBox(height: 11),
              Text(label, maxLines: 1, overflow: TextOverflow.ellipsis,
                  style: _style(12, _muted, FontWeight.w600)),
              const SizedBox(height: 3),
              Text(value, style: _style(27, _text, FontWeight.w800)),
              Text(caption, maxLines: 1, overflow: TextOverflow.ellipsis,
                  style: _style(10, _muted)),
            ]),
          ),
        ),
      );

  Widget _salesChart(Map<String, dynamic> revenue) {
    final raw = revenue[_show30Days ? 'series30' : 'series7'];
    final points = raw is List ? raw.map(_map).toList() : <Map<String, dynamic>>[];
    final max = points.fold<int>(0, (value, point) {
      final amount = _number(point['amount']);
      return amount > value ? amount : value;
    });
    return _surface(child: Column(crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [
          Expanded(child: Text('Xu hướng doanh thu',
              style: _style(16, _text, FontWeight.w800))),
          TextButton(
            onPressed: () => setState(() => _show30Days = !_show30Days),
            child: Text(_show30Days ? '30 ngày' : '7 ngày'),
          ),
        ]),
        Text('Giá trị đơn đã giao theo ngày tạo đơn',
            style: _style(11, _muted)),
        const SizedBox(height: 23),
        SizedBox(height: 150, child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            for (var index = 0; index < points.length; index++)
              Expanded(child: Column(mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Tooltip(
                    message: '${_dateLabel(points[index]['date'])}: ${_money(points[index]['amount'])}',
                    child: Container(
                      height: max == 0 ? 2 : 118 * _number(points[index]['amount']) / max + 2,
                      width: _show30Days ? 5 : 24,
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter, end: Alignment.bottomCenter,
                          colors: [Color(0xFF42BDCF), Color(0xFF0284C7)],
                        ),
                        borderRadius: BorderRadius.vertical(top: Radius.circular(6)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _show30Days ? '' : _dateLabel(points[index]['date']),
                    style: _style(9, _muted),
                    maxLines: 1,
                  ),
                ],
              )),
          ],
        )),
        if (_show30Days && points.isNotEmpty)
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text(_dateLabel(points.first['date']), style: _style(10, _muted)),
            Text(_dateLabel(points.last['date']), style: _style(10, _muted)),
          ]),
      ],
    ));
  }

  Widget _orderProgress(Map<String, dynamic> orders) => _surface(
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Tiến độ đơn hàng', style: _style(16, _text, FontWeight.w800)),
      const SizedBox(height: 4),
      Text('Tổng quan quy trình xử lý', style: _style(11, _muted)),
      const SizedBox(height: 13),
      _orderRow('Chờ duyệt', _number(orders['pending']), const Color(0xFFE9A53A)),
      _orderRow('Đang đóng gói', _number(orders['packing']), const Color(0xFF38A8DC)),
      _orderRow('Đang giao', _number(orders['shipping']), const Color(0xFF9775D6)),
      _orderRow('Đã giao trong tháng', _number(orders['deliveredMonth']),
          const Color(0xFF29B88B)),
      const SizedBox(height: 11),
      TextButton.icon(
        onPressed: () => widget.onNavigate(3),
        label: const Text('Xem đơn hàng'),
        icon: const Icon(Icons.arrow_forward_rounded, size: 17),
      ),
    ]),
  );

  Widget _orderRow(String label, int count, Color color) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 10),
    child: Row(children: [
      CircleAvatar(radius: 4, backgroundColor: color),
      const SizedBox(width: 10),
      Expanded(child: Text(label, style: _style(12, _muted))),
      Text('$count', style: _style(14, _text, FontWeight.w800)),
    ]),
  );

  Widget _recentOrders(dynamic raw) {
    final orders = raw is List ? raw.map(_map).toList() : <Map<String, dynamic>>[];
    const labels = {
      'pending': 'Chờ duyệt', 'confirmed': 'Đã duyệt',
      'approved': 'Đã duyệt', 'shipping': 'Đang giao',
      'delivered': 'Đã giao', 'cancelled': 'Đã hủy',
    };
    return _surface(child: Column(crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Đơn hàng gần đây', style: _style(16, _text, FontWeight.w800)),
        const SizedBox(height: 4),
        Text('Cập nhật từ hệ thống', style: _style(11, _muted)),
        const SizedBox(height: 12),
        if (orders.isEmpty) Text('Chưa có đơn hàng.', style: _style(12, _muted)),
        for (final order in orders)
          InkWell(
            onTap: () => widget.onNavigate(3),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 11),
              child: Row(children: [
                const Icon(Icons.shopping_bag_outlined,
                    color: Color(0xFF35A6DD), size: 20),
                const SizedBox(width: 10),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Đơn #${order['id']}',
                        style: _style(12, _text, FontWeight.w700)),
                    Text(labels[order['status']] ?? '${order['status']}',
                        style: _style(10, _muted)),
                  ],
                )),
                Text(_dateLabel(order['createdAt']), style: _style(10, _muted)),
                const SizedBox(width: 4),
                Icon(Icons.chevron_right_rounded, size: 18, color: _muted),
              ]),
            ),
          ),
      ],
    ));
  }

  Widget _shortcuts() => _surface(child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text('Truy cập nhanh', style: _style(16, _text, FontWeight.w800)),
      const SizedBox(height: 8),
      _shortcut('Quản lý đơn hàng', Icons.shopping_bag_outlined, 3),
      _shortcut('Thiết bị & kho', Icons.inventory_2_outlined, 1),
      _shortcut('Nhân viên', Icons.people_alt_outlined, 2),
      _shortcut('Gói cước', Icons.layers_outlined, 4),
    ],
  ));

  Widget _shortcut(String label, IconData icon, int tab) => InkWell(
    onTap: () => widget.onNavigate(tab),
    child: Padding(
      padding: const EdgeInsets.symmetric(vertical: 11),
      child: Row(children: [
        Icon(icon, color: const Color(0xFF0284C7), size: 19),
        const SizedBox(width: 10),
        Expanded(child: Text(label, style: _style(12, _text, FontWeight.w600))),
        Icon(Icons.arrow_forward_rounded, color: _muted, size: 17),
      ]),
    ),
  );
}
