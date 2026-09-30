import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/fish_species_model.dart';
import '../models/device_model.dart';
import '../models/staff_model.dart';
import '../models/order_model.dart';
import '../models/subscription_plan_model.dart';
import '../services/supabase_service.dart';
import '../widgets/floating_role_nav.dart';
import 'login_screen.dart';
export 'staff_screen.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  bool _isDark = true;
  bool _isLoading = true;
  int _activeTab =
      0; // 0: Species, 1: Devices, 2: Staff, 3: Orders, 4: Subscriptions

  // User Profile State
  String _adminName = 'Admin AquaCare';
  String _adminInitials = 'A';

  // Fish Species State
  List<FishSpecies> _speciesList = [];
  List<FishSpecies> _filteredSpeciesList = [];
  final TextEditingController _speciesSearchCtrl = TextEditingController();

  // Devices & Warehouse State
  List<DeviceModel> _devicesList = [];
  List<DeviceModel> _filteredDevicesList = [];
  Map<String, BuyerInfo> _macCustomerMap = {};
  final TextEditingController _deviceSearchCtrl = TextEditingController();
  String _deviceFilterVersion = 'all'; // all, V1, V2, V3, V4
  String _deviceFilterStatus = 'all'; // all, active, bought, inactive
  int _devicePage = 0;
  static const int _pageSize = 12;

  // Staff Management State
  List<StaffModel> _staffList = [];
  List<StaffModel> _filteredStaffList = [];
  final TextEditingController _staffSearchCtrl = TextEditingController();
  String _staffFilterRole =
      'all'; // all, staff_warehouse, staff_shipper, staff_support, staff_maintenance, staff

  // Orders Management State
  List<OrderModel> _ordersList = [];
  List<OrderModel> _filteredOrdersList = [];
  final TextEditingController _orderSearchCtrl = TextEditingController();
  String _orderFilterStatus =
      'all'; // all, pending, confirmed, shipping, delivered, cancelled

  // Subscriptions Management State
  List<SubscriptionPlanModel> _subscriptionsList = [];
  List<SubscriptionPlanModel> _filteredSubscriptionsList = [];
  final TextEditingController _subSearchCtrl = TextEditingController();
  String _subFilterType = 'all'; // all, free, premium, enterprise

  @override
  void initState() {
    super.initState();
    _loadThemePreference();
    _loadUserProfile();
    _fetchData();
    _speciesSearchCtrl.addListener(_onSpeciesSearchChanged);
    _deviceSearchCtrl.addListener(_onDeviceSearchChanged);
    _staffSearchCtrl.addListener(_onStaffSearchChanged);
    _orderSearchCtrl.addListener(_onOrderSearchChanged);
    _subSearchCtrl.addListener(_onSubSearchChanged);
  }

  @override
  void dispose() {
    _speciesSearchCtrl.dispose();
    _deviceSearchCtrl.dispose();
    _staffSearchCtrl.dispose();
    _orderSearchCtrl.dispose();
    _subSearchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadThemePreference() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _isDark = prefs.getBool('admin_is_dark') ?? true;
    });
  }

  Future<void> _toggleTheme() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _isDark = !_isDark;
    });
    await prefs.setBool('admin_is_dark', _isDark);
  }

  Future<void> _loadUserProfile() async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user != null) {
        final res = await Supabase.instance.client
            .from('users')
            .select('full_name, phone, role')
            .eq('id', user.id)
            .maybeSingle();

        if (res != null &&
            res['full_name'] != null &&
            (res['full_name'] as String).isNotEmpty) {
          final fullName = res['full_name'] as String;
          setState(() {
            _adminName = fullName;
            _adminInitials = _getInitials(fullName);
          });
          return;
        }
      }

      final prefs = await SharedPreferences.getInstance();
      final savedName = prefs.getString('user_full_name');
      if (savedName != null && savedName.isNotEmpty) {
        setState(() {
          _adminName = savedName;
          _adminInitials = _getInitials(savedName);
        });
      }
    } catch (e) {
      debugPrint('⚠️ Error loading admin user profile: $e');
    }
  }

  String _getInitials(String name) {
    if (name.trim().isEmpty) return 'A';
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      if (_activeTab == 0) {
        final spData = await SupabaseService.instance.getFishSpecies();
        final species = spData
            .map((json) => FishSpecies.fromJson(json))
            .toList();
        setState(() {
          _speciesList = species;
          _filterSpecies();
          _isLoading = false;
        });
      } else if (_activeTab == 1) {
        final devData = await SupabaseService.instance.getDevices();
        final devices = devData
            .map((json) => DeviceModel.fromJson(json))
            .toList();

        final mapData = await SupabaseService.instance.getMacCustomerMap();
        final Map<String, BuyerInfo> parsedMap = {};
        mapData.forEach((key, val) {
          parsedMap[key] = BuyerInfo.fromJson(val);
        });

        setState(() {
          _devicesList = devices;
          _macCustomerMap = parsedMap;
          _filterDevices();
          _isLoading = false;
        });
      } else if (_activeTab == 2) {
        final staffData = await SupabaseService.instance.getStaff();
        final staffList = staffData
            .map((json) => StaffModel.fromJson(json))
            .toList();
        setState(() {
          _staffList = staffList;
          _filterStaff();
          _isLoading = false;
        });
      } else if (_activeTab == 3) {
        final ordersData = await SupabaseService.instance.getOrders();
        final ordersList = ordersData
            .map((json) => OrderModel.fromJson(json))
            .toList();
        setState(() {
          _ordersList = ordersList;
          _filterOrders();
          _isLoading = false;
        });
      } else if (_activeTab == 4) {
        final subData = await SupabaseService.instance.getSubscriptionPlans();
        final subsList = subData
            .map((json) => SubscriptionPlanModel.fromJson(json))
            .toList();
        setState(() {
          _subscriptionsList = subsList;
          _filterSubscriptions();
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      debugPrint('❌ Error fetching data: $e');
      setState(() => _isLoading = false);
      if (mounted) {
        _showSnackBar('Lỗi khi tải dữ liệu: $e', isError: true);
      }
    }
  }

  // ─── Fish Species Search & Filtering ───
  void _onSpeciesSearchChanged() {
    _filterSpecies();
  }

  void _filterSpecies() {
    final query = _speciesSearchCtrl.text.trim().toLowerCase();
    if (query.isEmpty) {
      _filteredSpeciesList = List.from(_speciesList);
    } else {
      _filteredSpeciesList = _speciesList
          .where((s) => s.speciesName.toLowerCase().contains(query))
          .toList();
    }
    setState(() {});
  }

  // ─── Devices Search & Filtering ───
  void _onDeviceSearchChanged() {
    _devicePage = 0;
    _filterDevices();
  }

  void _filterDevices() {
    final query = _deviceSearchCtrl.text.trim().toUpperCase();
    _filteredDevicesList = _devicesList.where((d) {
      // 1. Search Query
      final matchSearch =
          query.isEmpty || d.macAddress.toUpperCase().contains(query);

      // 2. Version Filter
      bool matchVersion = true;
      if (_deviceFilterVersion != 'all') {
        final vNorm = _getNormalizedVersion(d.firmwareVersion);
        matchVersion = (vNorm == _deviceFilterVersion);
      }

      // 3. Status Filter (Strictly matches DB condition)
      bool matchStatus = true;
      if (_deviceFilterStatus == 'active') {
        matchStatus = (d.tankId != null);
      } else if (_deviceFilterStatus == 'bought') {
        matchStatus = (d.tankId == null && d.isActive == true);
      } else if (_deviceFilterStatus == 'inactive') {
        matchStatus = (d.tankId == null && d.isActive == false);
      }

      return matchSearch && matchVersion && matchStatus;
    }).toList();

    setState(() {});
  }

  String _getNormalizedVersion(String version) {
    final v = version.toUpperCase();
    if (v.contains('V1')) return 'V1';
    if (v.contains('V2')) return 'V2';
    if (v.contains('V3')) return 'V3';
    if (v.contains('V4')) return 'V4';
    return 'V1';
  }

  // ─── Staff Search & Filtering ───
  void _onStaffSearchChanged() {
    _filterStaff();
  }

  void _filterStaff() {
    final query = _staffSearchCtrl.text.trim().toLowerCase();
    _filteredStaffList = _staffList.where((s) {
      final matchSearch =
          query.isEmpty ||
          s.fullName.toLowerCase().contains(query) ||
          s.email.toLowerCase().contains(query) ||
          s.phone.contains(query);

      final matchRole = _staffFilterRole == 'all' || s.role == _staffFilterRole;

      return matchSearch && matchRole;
    }).toList();

    setState(() {});
  }

  // ─── Orders Search & Filtering ───
  void _onOrderSearchChanged() {
    _filterOrders();
  }

  void _filterOrders() {
    final query = _orderSearchCtrl.text.trim().toLowerCase();
    _filteredOrdersList = _ordersList.where((o) {
      final matchSearch =
          query.isEmpty ||
          o.customerName.toLowerCase().contains(query) ||
          o.phone.contains(query) ||
          o.id.toLowerCase().contains(query) ||
          o.productSummary.toLowerCase().contains(query) ||
          o.macsSummary.toLowerCase().contains(query);

      final matchStatus =
          _orderFilterStatus == 'all' || o.status == _orderFilterStatus;

      return matchSearch && matchStatus;
    }).toList();

    setState(() {});
  }

  // ─── Subscriptions Search & Filtering ───
  void _onSubSearchChanged() {
    _filterSubscriptions();
  }

  void _filterSubscriptions() {
    final query = _subSearchCtrl.text.trim().toLowerCase();
    _filteredSubscriptionsList = _subscriptionsList.where((s) {
      final matchSearch = query.isEmpty || s.name.toLowerCase().contains(query);
      final matchType = _subFilterType == 'all' || s.planType == _subFilterType;
      return matchSearch && matchType;
    }).toList();

    setState(() {});
  }

  void _showSnackBar(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isError ? Icons.error_outline : Icons.check_circle_outline,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                message,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: isError
            ? const Color(0xFFEF4444)
            : const Color(0xFF0284C7),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _handleLogout() {
    final modalBg = _isDark ? const Color(0xFF222225) : Colors.white;
    final textPrimary = _isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = _isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: modalBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Đăng xuất',
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w700,
            color: textPrimary,
          ),
        ),
        content: Text(
          'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản Admin?',
          style: GoogleFonts.inter(color: textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Hủy', style: GoogleFonts.inter(color: textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              elevation: 0,
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              await Supabase.instance.client.auth.signOut();
              final prefs = await SharedPreferences.getInstance();
              await prefs.clear();
              if (mounted) {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
            child: Text(
              'Đăng xuất',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Fish Species Modal Actions ───
  void _openSpeciesModal({FishSpecies? species}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _SpeciesFormSheet(
        species: species,
        isDark: _isDark,
        onSave: (data) async {
          try {
            if (species == null) {
              await SupabaseService.instance.addFishSpecies(data);
              _showSnackBar('Thêm loài cá thành công!');
            } else {
              await SupabaseService.instance.updateFishSpecies(
                species.id,
                data,
              );
              _showSnackBar('Cập nhật loài cá thành công!');
            }
            await _fetchData();
          } catch (e) {
            final errStr = e.toString();
            if (errStr.contains('23505') || errStr.contains('unique')) {
              _showSnackBar(
                'Tên loài cá này đã tồn tại trong hệ thống!',
                isError: true,
              );
            } else {
              _showSnackBar(
                errStr.replaceAll('Exception: ', ''),
                isError: true,
              );
            }
          }
        },
      ),
    );
  }

  void _confirmDeleteSpecies(FishSpecies species) {
    final modalBg = _isDark ? const Color(0xFF222225) : Colors.white;
    final textPrimary = _isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = _isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: modalBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Xóa loài cá',
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w700,
            color: textPrimary,
          ),
        ),
        content: Text(
          'Bạn có chắc chắn muốn xóa loài cá "${species.speciesName}"?',
          style: GoogleFonts.inter(color: textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Hủy', style: GoogleFonts.inter(color: textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              elevation: 0,
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await SupabaseService.instance.deleteFishSpecies(species.id);
                _showSnackBar('Xóa loài cá thành công!');
                await _fetchData();
              } catch (e) {
                _showSnackBar('Lỗi khi xóa loài cá: $e', isError: true);
              }
            },
            child: Text(
              'Xóa',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Devices Modal Actions ───
  void _openDeviceModal({DeviceModel? device}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _DeviceFormSheet(
        device: device,
        isDark: _isDark,
        onSave: (macInput, version) async {
          try {
            if (device == null) {
              await SupabaseService.instance.addDeviceBatch(
                rawMacInput: macInput,
                firmwareVersion: version,
              );
              _showSnackBar('Thêm thiết bị thành công!');
            } else {
              await SupabaseService.instance.updateDevice(
                id: device.id,
                macAddress: macInput,
                firmwareVersion: version,
              );
              _showSnackBar('Cập nhật thiết bị thành công!');
            }
            await _fetchData();
          } catch (e) {
            final errStr = e.toString();
            if (errStr.contains('23505') || errStr.contains('unique')) {
              _showSnackBar(
                'Địa chỉ MAC này đã tồn tại trong hệ thống!',
                isError: true,
              );
            } else {
              _showSnackBar(
                errStr.replaceAll('Exception: ', ''),
                isError: true,
              );
            }
          }
        },
      ),
    );
  }

  void _confirmDeleteDevice(DeviceModel device) {
    final modalBg = _isDark ? const Color(0xFF222225) : Colors.white;
    final textPrimary = _isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = _isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: modalBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Xóa thiết bị',
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w700,
            color: textPrimary,
          ),
        ),
        content: Text(
          'Bạn có chắc chắn muốn xóa thiết bị MAC "${device.macAddress}"?',
          style: GoogleFonts.inter(color: textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Hủy', style: GoogleFonts.inter(color: textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              elevation: 0,
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await SupabaseService.instance.deleteDevice(device.id);
                _showSnackBar('Xóa thiết bị thành công!');
                await _fetchData();
              } catch (e) {
                _showSnackBar('Lỗi khi xóa thiết bị: $e', isError: true);
              }
            },
            child: Text(
              'Xóa',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showBuyerDetails(BuyerInfo buyer) {
    final modalBg = _isDark ? const Color(0xFF222225) : Colors.white;
    final textPrimary = _isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = _isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);
    final border = _isDark ? const Color(0xFF333333) : const Color(0xFFCBD5E1);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: modalBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Thông tin người mua',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                color: textPrimary,
                fontSize: 16,
              ),
            ),
            IconButton(
              onPressed: () => Navigator.pop(ctx),
              icon: Icon(Icons.close_rounded, color: textSecondary, size: 20),
              constraints: const BoxConstraints(),
              padding: EdgeInsets.zero,
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDetailRow(
              'Họ & Tên',
              buyer.customerName,
              textPrimary,
              textSecondary,
            ),
            Divider(color: border, height: 16),
            _buildDetailRow(
              'Số điện thoại',
              buyer.phone,
              textPrimary,
              textSecondary,
            ),
            Divider(color: border, height: 16),
            _buildDetailRow('Email', buyer.email, textPrimary, textSecondary),
            Divider(color: border, height: 16),
            _buildDetailRow(
              'Địa chỉ giao hàng',
              buyer.address,
              textPrimary,
              textSecondary,
            ),
            Divider(color: border, height: 16),
            _buildDetailRow(
              'Sản phẩm mua',
              buyer.productName,
              textPrimary,
              textSecondary,
            ),
            Divider(color: border, height: 16),
            _buildDetailRow(
              'Mã đơn hàng',
              buyer.orderId,
              textPrimary,
              textSecondary,
            ),
          ],
        ),
        actions: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0284C7),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                elevation: 0,
              ),
              onPressed: () => Navigator.pop(ctx),
              child: Text(
                'Đóng',
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Staff Modal Actions ───
  void _openStaffModal({StaffModel? staff}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _StaffFormSheet(
        staff: staff,
        isDark: _isDark,
        onSave: (fullName, email, phone, password, role) async {
          try {
            if (staff == null) {
              await SupabaseService.instance.addStaff(
                fullName: fullName,
                email: email,
                phone: phone,
                password: password,
                role: role,
              );
              _showSnackBar('Thêm nhân viên thành công!');
            } else {
              await SupabaseService.instance.updateStaff(
                id: staff.id,
                fullName: fullName,
                phone: phone,
                role: role,
              );
              _showSnackBar('Cập nhật nhân viên thành công!');
            }
            await _fetchData();
          } catch (e) {
            final errStr = e.toString();
            if (errStr.contains('23505') ||
                errStr.contains('unique') ||
                errStr.contains('already registered')) {
              _showSnackBar(
                'Email hoặc Số điện thoại này đã được sử dụng!',
                isError: true,
              );
            } else {
              _showSnackBar(
                errStr.replaceAll('Exception: ', ''),
                isError: true,
              );
            }
          }
        },
      ),
    );
  }

  void _confirmDeleteStaff(StaffModel staff) {
    final modalBg = _isDark ? const Color(0xFF222225) : Colors.white;
    final textPrimary = _isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = _isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: modalBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Xóa nhân viên',
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w700,
            color: textPrimary,
          ),
        ),
        content: Text(
          'Bạn có chắc chắn muốn xóa nhân viên "${staff.fullName}" (${staff.email})?',
          style: GoogleFonts.inter(color: textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Hủy', style: GoogleFonts.inter(color: textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              elevation: 0,
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await SupabaseService.instance.deleteStaff(staff.id);
                _showSnackBar('Xóa nhân viên thành công!');
                await _fetchData();
              } catch (e) {
                _showSnackBar('Lỗi khi xóa nhân viên: $e', isError: true);
              }
            },
            child: Text(
              'Xóa',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(
    String label,
    String value,
    Color textPrimary,
    Color textSecondary,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: textSecondary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bgColor = _isDark ? const Color(0xFF141414) : const Color(0xFFF8FAFC);
    final topbarBg = _isDark ? const Color(0xFF1F1F1F) : Colors.white;
    final cardBorder = _isDark
        ? const Color(0xFF333333)
        : const Color(0xFFCBD5E1);
    final inputBg = _isDark ? const Color(0xFF181818) : Colors.white;
    final textPrimary = _isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = _isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF334155);
    final primary = const Color(0xFF0284C7);

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        bottom: false,
        child: Stack(
          children: [
            Column(
              children: [
                // ── Top Header ──
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 14,
                  ),
                  decoration: BoxDecoration(
                    color: topbarBg,
                    border: Border(bottom: BorderSide(color: cardBorder)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          color: primary,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Center(
                          child: Text(
                            _adminInitials,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _adminName,
                              style: GoogleFonts.inter(
                                fontSize: 15.5,
                                fontWeight: FontWeight.w700,
                                color: textPrimary,
                              ),
                            ),
                            Text(
                              'Quản trị AquaCare System',
                              style: GoogleFonts.inter(
                                fontSize: 11.5,
                                color: textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: _toggleTheme,
                        icon: Icon(
                          _isDark
                              ? Icons.wb_sunny_outlined
                              : Icons.nightlight_round_outlined,
                          color: textSecondary,
                          size: 22,
                        ),
                        tooltip: _isDark
                            ? 'Chuyển sang Chế độ Sáng'
                            : 'Chuyển sang Chế độ Tối',
                      ),
                      IconButton(
                        onPressed: _handleLogout,
                        icon: Icon(
                          Icons.logout_rounded,
                          color: textSecondary,
                          size: 22,
                        ),
                        tooltip: 'Đăng xuất',
                      ),
                    ],
                  ),
                ),

                // ── Main Content Area ──
                Expanded(
                  child: _activeTab == 0
                      ? _buildSpeciesTab(
                          primary,
                          textPrimary,
                          textSecondary,
                          inputBg,
                          cardBorder,
                        )
                      : _activeTab == 1
                      ? _buildDevicesTab(
                          primary,
                          textPrimary,
                          textSecondary,
                          inputBg,
                          cardBorder,
                        )
                      : _activeTab == 2
                      ? _buildStaffTab(
                          primary,
                          textPrimary,
                          textSecondary,
                          inputBg,
                          cardBorder,
                        )
                      : _activeTab == 3
                      ? _buildOrdersTab(
                          primary,
                          textPrimary,
                          textSecondary,
                          inputBg,
                          cardBorder,
                        )
                      : _buildSubscriptionsTab(
                          primary,
                          textPrimary,
                          textSecondary,
                          inputBg,
                          cardBorder,
                        ),
                ),
              ],
            ),
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: FloatingRoleNav(
                isDark: _isDark,
                selectedIndex: _activeTab,
                items: [
                  FloatingRoleNavItem(
                    label: 'Loài cá',
                    symbol: 'fish',
                    onTap: () {
                      setState(() => _activeTab = 0);
                      _fetchData();
                    },
                  ),
                  FloatingRoleNavItem(
                    label: 'Thiết bị',
                    symbol: 'device',
                    onTap: () {
                      setState(() => _activeTab = 1);
                      _fetchData();
                    },
                  ),
                  FloatingRoleNavItem(
                    label: 'Nhân viên',
                    symbol: 'staff',
                    onTap: () {
                      setState(() => _activeTab = 2);
                      _fetchData();
                    },
                  ),
                  FloatingRoleNavItem(
                    label: 'Đơn hàng',
                    symbol: 'cart',
                    onTap: () {
                      setState(() => _activeTab = 3);
                      _fetchData();
                    },
                  ),
                  FloatingRoleNavItem(
                    label: 'Gói cước',
                    symbol: 'layers',
                    onTap: () {
                      setState(() => _activeTab = 4);
                      _fetchData();
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── TAB 0: FISH SPECIES UI ───
  Widget _buildSpeciesTab(
    Color primary,
    Color textPrimary,
    Color textSecondary,
    Color inputBg,
    Color cardBorder,
  ) {
    return RefreshIndicator(
      onRefresh: _fetchData,
      color: primary,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _speciesSearchCtrl,
                    style: GoogleFonts.inter(
                      color: textPrimary,
                      fontSize: 13.5,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Tìm kiếm loài cá...',
                      hintStyle: GoogleFonts.inter(
                        color: textSecondary,
                        fontSize: 13,
                      ),
                      prefixIcon: Icon(
                        Icons.search_rounded,
                        color: textSecondary,
                        size: 18,
                      ),
                      filled: true,
                      fillColor: inputBg,
                      contentPadding: const EdgeInsets.symmetric(
                        vertical: 10,
                        horizontal: 14,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: cardBorder),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: cardBorder),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: primary, width: 1.5),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton.icon(
                  onPressed: () => _openSpeciesModal(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primary,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    elevation: 0,
                  ),
                  icon: const Icon(
                    Icons.add_rounded,
                    color: Colors.white,
                    size: 18,
                  ),
                  label: Text(
                    'Thêm cá',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator(color: primary))
                : _filteredSpeciesList.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.set_meal_outlined,
                          size: 48,
                          color: textSecondary.withOpacity(0.5),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Không tìm thấy loài cá nào',
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: textSecondary,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: EdgeInsets.fromLTRB(
                      16, 4, 16, 96 + MediaQuery.paddingOf(context).bottom,
                    ),
                    itemCount: _filteredSpeciesList.length,
                    itemBuilder: (ctx, index) {
                      final item = _filteredSpeciesList[index];
                      return _SpeciesCard(
                        species: item,
                        isDark: _isDark,
                        onEdit: () => _openSpeciesModal(species: item),
                        onDelete: () => _confirmDeleteSpecies(item),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  // ─── TAB 1: DEVICES & WAREHOUSE UI ───
  Widget _buildDevicesTab(
    Color primary,
    Color textPrimary,
    Color textSecondary,
    Color inputBg,
    Color cardBorder,
  ) {
    final totalPages = (_filteredDevicesList.length / _pageSize).ceil();
    final safeTotalPages = totalPages == 0 ? 1 : totalPages;
    final startIndex = _devicePage * _pageSize;
    final endIndex = (startIndex + _pageSize > _filteredDevicesList.length)
        ? _filteredDevicesList.length
        : startIndex + _pageSize;

    final currentPageDevices = (startIndex < _filteredDevicesList.length)
        ? _filteredDevicesList.sublist(startIndex, endIndex)
        : <DeviceModel>[];

    return RefreshIndicator(
      onRefresh: _fetchData,
      color: primary,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _deviceSearchCtrl,
                        style: GoogleFonts.inter(
                          color: textPrimary,
                          fontSize: 13.5,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Tìm theo MAC (ví dụ: 83:BC...)...',
                          hintStyle: GoogleFonts.inter(
                            color: textSecondary,
                            fontSize: 12.5,
                          ),
                          prefixIcon: Icon(
                            Icons.search_rounded,
                            color: textSecondary,
                            size: 18,
                          ),
                          filled: true,
                          fillColor: inputBg,
                          contentPadding: const EdgeInsets.symmetric(
                            vertical: 10,
                            horizontal: 14,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: cardBorder),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: cardBorder),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: primary, width: 1.5),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      onPressed: () => _openDeviceModal(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primary,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 12,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        elevation: 0,
                      ),
                      icon: const Icon(
                        Icons.add_rounded,
                        color: Colors.white,
                        size: 18,
                      ),
                      label: Text(
                        'Thêm TB',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w700,
                          fontSize: 12.5,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        decoration: BoxDecoration(
                          color: inputBg,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: cardBorder),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _deviceFilterVersion,
                            isExpanded: true,
                            dropdownColor: _isDark
                                ? const Color(0xFF222225)
                                : Colors.white,
                            style: GoogleFonts.inter(
                              color: textPrimary,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                            onChanged: (val) {
                              if (val != null) {
                                setState(() {
                                  _deviceFilterVersion = val;
                                  _devicePage = 0;
                                  _filterDevices();
                                });
                              }
                            },
                            items: const [
                              DropdownMenuItem(
                                value: 'all',
                                child: Text('Tất cả phiên bản'),
                              ),
                              DropdownMenuItem(
                                value: 'V1',
                                child: Text('Phiên bản V1'),
                              ),
                              DropdownMenuItem(
                                value: 'V2',
                                child: Text('Phiên bản V2'),
                              ),
                              DropdownMenuItem(
                                value: 'V3',
                                child: Text('Phiên bản V3'),
                              ),
                              DropdownMenuItem(
                                value: 'V4',
                                child: Text('Phiên bản V4'),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        decoration: BoxDecoration(
                          color: inputBg,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: cardBorder),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _deviceFilterStatus,
                            isExpanded: true,
                            dropdownColor: _isDark
                                ? const Color(0xFF222225)
                                : Colors.white,
                            style: GoogleFonts.inter(
                              color: textPrimary,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                            onChanged: (val) {
                              if (val != null) {
                                setState(() {
                                  _deviceFilterStatus = val;
                                  _devicePage = 0;
                                  _filterDevices();
                                });
                              }
                            },
                            items: const [
                              DropdownMenuItem(
                                value: 'all',
                                child: Text('Tất cả trạng thái'),
                              ),
                              DropdownMenuItem(
                                value: 'active',
                                child: Text('Đang dùng'),
                              ),
                              DropdownMenuItem(
                                value: 'bought',
                                child: Text('Đã được mua'),
                              ),
                              DropdownMenuItem(
                                value: 'inactive',
                                child: Text('Trong kho'),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Tổng: ${_filteredDevicesList.length} thiết bị',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: textSecondary,
                  ),
                ),
                Row(
                  children: [
                    IconButton(
                      onPressed: _devicePage > 0
                          ? () => setState(() => _devicePage--)
                          : null,
                      icon: const Icon(Icons.chevron_left_rounded, size: 20),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      color: textPrimary,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${_devicePage + 1} / $safeTotalPages',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(width: 4),
                    IconButton(
                      onPressed: (_devicePage < safeTotalPages - 1)
                          ? () => setState(() => _devicePage++)
                          : null,
                      icon: const Icon(Icons.chevron_right_rounded, size: 20),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      color: textPrimary,
                    ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator(color: primary))
                : currentPageDevices.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.inventory_2_outlined,
                          size: 48,
                          color: textSecondary.withOpacity(0.5),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Không tìm thấy thiết bị nào trong kho',
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: textSecondary,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: EdgeInsets.fromLTRB(
                      16, 4, 16, 96 + MediaQuery.paddingOf(context).bottom,
                    ),
                    itemCount: currentPageDevices.length,
                    itemBuilder: (ctx, index) {
                      final dev = currentPageDevices[index];
                      final buyerInfo =
                          _macCustomerMap[dev.macAddress.toUpperCase()];
                      return _DeviceCard(
                        device: dev,
                        buyerInfo: buyerInfo,
                        isDark: _isDark,
                        onEdit: () => _openDeviceModal(device: dev),
                        onDelete: () => _confirmDeleteDevice(dev),
                        onViewBuyer: buyerInfo != null
                            ? () => _showBuyerDetails(buyerInfo)
                            : null,
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  // ─── TAB 2: STAFF MANAGEMENT UI ───
  Widget _buildStaffTab(
    Color primary,
    Color textPrimary,
    Color textSecondary,
    Color inputBg,
    Color cardBorder,
  ) {
    return RefreshIndicator(
      onRefresh: _fetchData,
      color: primary,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _staffSearchCtrl,
                        style: GoogleFonts.inter(
                          color: textPrimary,
                          fontSize: 13.5,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Tìm theo tên, email, sđt...',
                          hintStyle: GoogleFonts.inter(
                            color: textSecondary,
                            fontSize: 12.5,
                          ),
                          prefixIcon: Icon(
                            Icons.search_rounded,
                            color: textSecondary,
                            size: 18,
                          ),
                          filled: true,
                          fillColor: inputBg,
                          contentPadding: const EdgeInsets.symmetric(
                            vertical: 10,
                            horizontal: 14,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: cardBorder),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: cardBorder),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: primary, width: 1.5),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      onPressed: () => _openStaffModal(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primary,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 12,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        elevation: 0,
                      ),
                      icon: const Icon(
                        Icons.add_rounded,
                        color: Colors.white,
                        size: 18,
                      ),
                      label: Text(
                        'Thêm NV',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w700,
                          fontSize: 12.5,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Role Filter Dropdown
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  decoration: BoxDecoration(
                    color: inputBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: cardBorder),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _staffFilterRole,
                      isExpanded: true,
                      dropdownColor: _isDark
                          ? const Color(0xFF222225)
                          : Colors.white,
                      style: GoogleFonts.inter(
                        color: textPrimary,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                      onChanged: (val) {
                        if (val != null) {
                          setState(() {
                            _staffFilterRole = val;
                            _filterStaff();
                          });
                        }
                      },
                      items: const [
                        DropdownMenuItem(
                          value: 'all',
                          child: Text('Tất cả vai trò'),
                        ),
                        DropdownMenuItem(
                          value: 'staff_warehouse',
                          child: Text('Nhân viên kho'),
                        ),
                        DropdownMenuItem(
                          value: 'staff_shipper',
                          child: Text('Nhân viên giao hàng'),
                        ),
                        DropdownMenuItem(
                          value: 'staff_support',
                          child: Text('Nhân viên hỗ trợ'),
                        ),
                        DropdownMenuItem(
                          value: 'staff_maintenance',
                          child: Text('Nhân viên bảo trì'),
                        ),
                        DropdownMenuItem(value: 'staff', child: Text('Staff')),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Tổng: ${_filteredStaffList.length} nhân viên',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: textSecondary,
                  ),
                ),
              ],
            ),
          ),

          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator(color: primary))
                : _filteredStaffList.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.badge_outlined,
                          size: 48,
                          color: textSecondary.withOpacity(0.5),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Không tìm thấy nhân viên nào',
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: textSecondary,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: EdgeInsets.fromLTRB(
                      16, 4, 16, 96 + MediaQuery.paddingOf(context).bottom,
                    ),
                    itemCount: _filteredStaffList.length,
                    itemBuilder: (ctx, index) {
                      final st = _filteredStaffList[index];
                      return _StaffCard(
                        staff: st,
                        isDark: _isDark,
                        onEdit: () => _openStaffModal(staff: st),
                        onDelete: () => _confirmDeleteStaff(st),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrdersTab(
    Color primary,
    Color textPrimary,
    Color textSecondary,
    Color inputBg,
    Color cardBorder,
  ) {
    final pendingCount = _ordersList.where((o) => o.status == 'pending').length;

    return RefreshIndicator(
      onRefresh: _fetchData,
      color: primary,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Quản lý đơn hàng (${_filteredOrdersList.length}/${_ordersList.length})',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                    if (pendingCount > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF3C7),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '$pendingCount chờ duyệt',
                          style: GoogleFonts.inter(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFFD97706),
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 10),

                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _orderSearchCtrl,
                        style: GoogleFonts.inter(
                          color: textPrimary,
                          fontSize: 13,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Tìm theo tên, SĐT, mã đơn...',
                          hintStyle: GoogleFonts.inter(
                            color: textSecondary,
                            fontSize: 12.5,
                          ),
                          prefixIcon: Icon(
                            Icons.search_rounded,
                            color: textSecondary,
                            size: 18,
                          ),
                          filled: true,
                          fillColor: inputBg,
                          contentPadding: const EdgeInsets.symmetric(
                            vertical: 8,
                            horizontal: 12,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: cardBorder),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: cardBorder),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: primary, width: 1.5),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),

                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      decoration: BoxDecoration(
                        color: inputBg,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: cardBorder),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _orderFilterStatus,
                          dropdownColor: _isDark
                              ? const Color(0xFF1F1F1F)
                              : Colors.white,
                          style: GoogleFonts.inter(
                            color: textPrimary,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                          items: const [
                            DropdownMenuItem(
                              value: 'all',
                              child: Text('Tất cả'),
                            ),
                            DropdownMenuItem(
                              value: 'pending',
                              child: Text('Chờ duyệt'),
                            ),
                            DropdownMenuItem(
                              value: 'confirmed',
                              child: Text('Đã duyệt'),
                            ),
                            DropdownMenuItem(
                              value: 'shipping',
                              child: Text('Đang giao'),
                            ),
                            DropdownMenuItem(
                              value: 'delivered',
                              child: Text('Đã giao'),
                            ),
                          ],
                          onChanged: (val) {
                            if (val != null) {
                              setState(() {
                                _orderFilterStatus = val;
                                _filterOrders();
                              });
                            }
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator(color: primary))
                : _filteredOrdersList.isEmpty
                ? Center(
                    child: Text(
                      'Không tìm thấy đơn hàng nào',
                      style: GoogleFonts.inter(
                        color: textSecondary,
                        fontSize: 14,
                      ),
                    ),
                  )
                : ListView.builder(
                    padding: EdgeInsets.fromLTRB(
                      16, 6, 16, 96 + MediaQuery.paddingOf(context).bottom,
                    ),
                    itemCount: _filteredOrdersList.length,
                    itemBuilder: (ctx, idx) {
                      final order = _filteredOrdersList[idx];
                      return _OrderCard(
                        order: order,
                        isDark: _isDark,
                        onApprove: () => _confirmApproveOrder(order),
                        onViewDetails: () =>
                            _showOrderDetailsBottomSheet(order),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  void _confirmApproveOrder(OrderModel order) {
    final modalBg = _isDark ? const Color(0xFF222225) : Colors.white;
    final textPrimary = _isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = _isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: modalBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Duyệt đơn hàng #${order.id}',
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w700,
            color: textPrimary,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Xác nhận duyệt đơn hàng cho khách hàng "${order.customerName}"?',
              style: GoogleFonts.inter(color: textSecondary, fontSize: 13.5),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: _isDark
                    ? const Color(0xFF181818)
                    : const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: _isDark
                      ? const Color(0xFF333333)
                      : const Color(0xFFCBD5E1),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Sản phẩm: ${order.productSummary}',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Tổng tiền: ${order.totalPrice.toStringAsFixed(0)} ₫',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF16A34A),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Địa chỉ: ${order.address}',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                const Icon(
                  Icons.local_shipping_outlined,
                  size: 16,
                  color: Color(0xFF0284C7),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'Hệ thống sẽ tự động tạo việc đóng gói cho nhân viên kho.',
                    style: GoogleFonts.inter(
                      fontSize: 11.5,
                      color: textSecondary,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Hủy', style: GoogleFonts.inter(color: textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0284C7),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              elevation: 0,
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await SupabaseService.instance.approveOrder(
                  orderId: order.id,
                  userId: order.userId,
                  customerName: order.customerName,
                  phone: order.phone,
                  address: order.address,
                );
                _showSnackBar('Đã duyệt đơn #${order.id} và tạo việc cho Kho!');
                await _fetchData();
              } catch (e) {
                _showSnackBar('Lỗi khi duyệt đơn: $e', isError: true);
              }
            },
            child: Text(
              'Duyệt đơn',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showOrderDetailsBottomSheet(OrderModel order) {
    final modalBg = _isDark ? const Color(0xFF222225) : Colors.white;
    final textPrimary = _isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = _isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);
    final cardBorder = _isDark
        ? const Color(0xFF333333)
        : const Color(0xFFCBD5E1);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: modalBg,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Chi tiết đơn hàng #${order.id}',
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: textPrimary,
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(ctx),
                    icon: Icon(
                      Icons.close_rounded,
                      color: textSecondary,
                      size: 20,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              _buildDetailItem(
                'Khách hàng',
                order.customerName,
                textPrimary,
                textSecondary,
              ),
              _buildDetailItem(
                'Số điện thoại',
                order.phone,
                textPrimary,
                textSecondary,
              ),
              _buildDetailItem(
                'Email',
                order.email,
                textPrimary,
                textSecondary,
              ),
              _buildDetailItem(
                'Địa chỉ giao hàng',
                order.address,
                textPrimary,
                textSecondary,
              ),
              _buildDetailItem(
                'Hình thức thanh toán',
                order.paymentMethod,
                textPrimary,
                textSecondary,
              ),
              _buildDetailItem(
                'Trạng thái',
                order.statusLabel,
                textPrimary,
                textSecondary,
              ),
              if (order.note.isNotEmpty)
                _buildDetailItem(
                  'Ghi chú của khách',
                  order.note,
                  textPrimary,
                  textSecondary,
                ),

              const SizedBox(height: 14),
              Text(
                'Danh sách sản phẩm:',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 6),

              if (order.items.isEmpty)
                Text(
                  'Sản phẩm: ${order.productSummary}',
                  style: GoogleFonts.inter(fontSize: 12, color: textSecondary),
                )
              else
                ...order.items.map(
                  (item) => Container(
                    margin: const EdgeInsets.only(bottom: 6),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: _isDark
                          ? const Color(0xFF181818)
                          : const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: cardBorder),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              item.productName,
                              style: GoogleFonts.inter(
                                fontSize: 12.5,
                                fontWeight: FontWeight.w700,
                                color: textPrimary,
                              ),
                            ),
                            Text(
                              'x${item.quantity}',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: const Color(0xFF0284C7),
                              ),
                            ),
                          ],
                        ),
                        if (item.deviceMacs.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(
                            'Mã MAC: ${item.deviceMacs.join(', ')}',
                            style: GoogleFonts.firaCode(
                              fontSize: 11,
                              color: textSecondary,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),

              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Tổng cộng:',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: textPrimary,
                    ),
                  ),
                  Text(
                    '${order.totalPrice.toStringAsFixed(0)} ₫',
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF16A34A),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailItem(
    String title,
    String val,
    Color textPrimary,
    Color textSecondary,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(
              title,
              style: GoogleFonts.inter(fontSize: 12, color: textSecondary),
            ),
          ),
          Expanded(
            child: Text(
              val,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubscriptionsTab(
    Color primary,
    Color textPrimary,
    Color textSecondary,
    Color inputBg,
    Color cardBorder,
  ) {
    return RefreshIndicator(
      onRefresh: _fetchData,
      color: primary,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _subSearchCtrl,
                        style: GoogleFonts.inter(
                          color: textPrimary,
                          fontSize: 13.5,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Tìm kiếm gói cước...',
                          hintStyle: GoogleFonts.inter(
                            color: textSecondary,
                            fontSize: 13,
                          ),
                          prefixIcon: Icon(
                            Icons.search_rounded,
                            color: textSecondary,
                            size: 18,
                          ),
                          filled: true,
                          fillColor: inputBg,
                          contentPadding: const EdgeInsets.symmetric(
                            vertical: 10,
                            horizontal: 14,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: cardBorder),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: cardBorder),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(color: primary, width: 1.5),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    ElevatedButton.icon(
                      onPressed: () => _openSubscriptionModal(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primary,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 12,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        elevation: 0,
                      ),
                      icon: const Icon(
                        Icons.add_rounded,
                        color: Colors.white,
                        size: 18,
                      ),
                      label: Text(
                        'Thêm gói',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Tổng: ${_filteredSubscriptionsList.length} gói cước',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: textSecondary,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      decoration: BoxDecoration(
                        color: inputBg,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: cardBorder),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _subFilterType,
                          dropdownColor: _isDark
                              ? const Color(0xFF1F1F1F)
                              : Colors.white,
                          style: GoogleFonts.inter(
                            color: textPrimary,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                          items: const [
                            DropdownMenuItem(
                              value: 'all',
                              child: Text('Tất cả loại gói'),
                            ),
                            DropdownMenuItem(
                              value: 'free',
                              child: Text('Miễn phí'),
                            ),
                            DropdownMenuItem(
                              value: 'premium',
                              child: Text('Cao cấp'),
                            ),
                            DropdownMenuItem(
                              value: 'enterprise',
                              child: Text('Doanh nghiệp'),
                            ),
                          ],
                          onChanged: (val) {
                            if (val != null) {
                              setState(() {
                                _subFilterType = val;
                                _filterSubscriptions();
                              });
                            }
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator(color: primary))
                : _filteredSubscriptionsList.isEmpty
                ? Center(
                    child: Text(
                      'Không tìm thấy gói cước nào',
                      style: GoogleFonts.inter(
                        color: textSecondary,
                        fontSize: 14,
                      ),
                    ),
                  )
                : ListView.builder(
                    padding: EdgeInsets.fromLTRB(
                      16, 4, 16, 96 + MediaQuery.paddingOf(context).bottom,
                    ),
                    itemCount: _filteredSubscriptionsList.length,
                    itemBuilder: (ctx, idx) {
                      final plan = _filteredSubscriptionsList[idx];
                      return _SubscriptionCard(
                        plan: plan,
                        isDark: _isDark,
                        onEdit: () => _openSubscriptionModal(plan: plan),
                        onDelete: () => _confirmDeleteSubscription(plan),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  void _openSubscriptionModal({SubscriptionPlanModel? plan}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _SubscriptionFormSheet(
        plan: plan,
        isDark: _isDark,
        onSave: (data) async {
          try {
            if (plan == null) {
              await SupabaseService.instance.addSubscriptionPlan(data);
              _showSnackBar('Thêm gói cước thành công!');
            } else {
              await SupabaseService.instance.updateSubscriptionPlan(
                plan.id,
                data,
              );
              _showSnackBar('Cập nhật gói cước thành công!');
            }
            await _fetchData();
          } catch (e) {
            _showSnackBar('Lỗi khi lưu gói cước: $e', isError: true);
          }
        },
      ),
    );
  }

  void _confirmDeleteSubscription(SubscriptionPlanModel plan) {
    final modalBg = _isDark ? const Color(0xFF222225) : Colors.white;
    final textPrimary = _isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = _isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: modalBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Xóa gói cước',
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w700,
            color: textPrimary,
          ),
        ),
        content: Text(
          'Bạn có chắc chắn muốn xóa gói cước "${plan.name}"?',
          style: GoogleFonts.inter(color: textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Hủy', style: GoogleFonts.inter(color: textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              elevation: 0,
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await SupabaseService.instance.deleteSubscriptionPlan(plan.id);
                _showSnackBar('Xóa gói cước thành công!');
                await _fetchData();
              } catch (e) {
                _showSnackBar('Lỗi khi xóa gói cước: $e', isError: true);
              }
            },
            child: Text(
              'Xóa',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Species Card Widget ──────────────────────────────────────────────────
class _SpeciesCard extends StatelessWidget {
  final FishSpecies species;
  final bool isDark;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _SpeciesCard({
    required this.species,
    required this.isDark,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final cardBg = isDark ? const Color(0xFF1F1F1F) : Colors.white;
    final cardBorder = isDark
        ? const Color(0xFF333333)
        : const Color(0xFFCBD5E1);
    final textPrimary = isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF334155);
    final primary = const Color(0xFF0284C7);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: isDark
                      ? const Color(0x330284C7)
                      : const Color(0xFFE0F2FE),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Icon(Icons.set_meal_rounded, color: primary, size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  species.speciesName,
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: textPrimary,
                  ),
                ),
              ),
              IconButton(
                onPressed: onEdit,
                icon: Icon(Icons.edit_outlined, color: textSecondary, size: 18),
                constraints: const BoxConstraints(),
                padding: const EdgeInsets.all(6),
                tooltip: 'Sửa',
              ),
              const SizedBox(width: 4),
              IconButton(
                onPressed: onDelete,
                icon: const Icon(
                  Icons.delete_outline_rounded,
                  color: Color(0xFFEF4444),
                  size: 18,
                ),
                constraints: const BoxConstraints(),
                padding: const EdgeInsets.all(6),
                tooltip: 'Xóa',
              ),
            ],
          ),
          const SizedBox(height: 12),

          Row(
            children: [
              Expanded(
                child: _ParamBadge(
                  label: 'Nhiệt độ',
                  value: '${species.tempMin} - ${species.tempMax} °C',
                  icon: Icons.thermostat_outlined,
                  isDark: isDark,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _ParamBadge(
                  label: 'Độ pH',
                  value: '${species.phMin} - ${species.phMax}',
                  icon: Icons.science_outlined,
                  isDark: isDark,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _ParamBadge(
                  label: 'TDS',
                  value:
                      '${species.tdsMin.toInt()} - ${species.tdsMax.toInt()} ppm',
                  icon: Icons.water_drop_outlined,
                  isDark: isDark,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Device Card Widget ───────────────────────────────────────────────────────
class _DeviceCard extends StatelessWidget {
  final DeviceModel device;
  final BuyerInfo? buyerInfo;
  final bool isDark;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback? onViewBuyer;

  const _DeviceCard({
    required this.device,
    this.buyerInfo,
    required this.isDark,
    required this.onEdit,
    required this.onDelete,
    this.onViewBuyer,
  });

  @override
  Widget build(BuildContext context) {
    final cardBg = isDark ? const Color(0xFF1F1F1F) : Colors.white;
    final cardBorder = isDark
        ? const Color(0xFF333333)
        : const Color(0xFFCBD5E1);
    final textPrimary = isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF334155);
    final primary = const Color(0xFF0284C7);

    String statusText = 'Trong kho';
    Color statusColor = const Color(0xFF16A34A);
    Color statusBg = isDark ? const Color(0x3316A34A) : const Color(0xFFDCFCE7);

    if (device.tankId != null) {
      statusText = 'Đang dùng';
      statusColor = const Color(0xFFD97706);
      statusBg = isDark ? const Color(0x33D97706) : const Color(0xFFFEF3C7);
    } else if (device.isActive) {
      statusText = 'Đã được mua';
      statusColor = const Color(0xFF0284C7);
      statusBg = isDark ? const Color(0x330284C7) : const Color(0xFFE0F2FE);
    }

    String ownerDisplay = '-';
    if (device.ownerName != null && device.ownerName!.isNotEmpty) {
      ownerDisplay = '${device.ownerName} (${device.ownerPhone ?? 'N/A'})';
    } else if (buyerInfo != null) {
      ownerDisplay = '${buyerInfo!.customerName} (${buyerInfo!.phone})';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: isDark
                      ? const Color(0xFF28282B)
                      : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: cardBorder),
                ),
                child: const Icon(
                  Icons.qr_code_2_rounded,
                  size: 18,
                  color: Color(0xFF0284C7),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  device.macAddress,
                  style: GoogleFonts.firaCode(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: textPrimary,
                  ),
                ),
              ),
              IconButton(
                onPressed: onEdit,
                icon: Icon(Icons.edit_outlined, color: textSecondary, size: 18),
                constraints: const BoxConstraints(),
                padding: const EdgeInsets.all(6),
                tooltip: 'Sửa',
              ),
              const SizedBox(width: 4),
              IconButton(
                onPressed: onDelete,
                icon: const Icon(
                  Icons.delete_outline_rounded,
                  color: Color(0xFFEF4444),
                  size: 18,
                ),
                constraints: const BoxConstraints(),
                padding: const EdgeInsets.all(6),
                tooltip: 'Xóa',
              ),
            ],
          ),
          const SizedBox(height: 10),

          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isDark
                      ? const Color(0xFF28282B)
                      : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: cardBorder),
                ),
                child: Text(
                  device.firmwareVersion,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: textPrimary,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  statusText,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          Row(
            children: [
              Icon(
                Icons.person_outline_rounded,
                size: 14,
                color: textSecondary,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'Sở hữu: $ownerDisplay',
                  style: GoogleFonts.inter(fontSize: 12, color: textSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (onViewBuyer != null) ...[
                const SizedBox(width: 6),
                InkWell(
                  onTap: onViewBuyer,
                  borderRadius: BorderRadius.circular(6),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: isDark
                          ? const Color(0x330284C7)
                          : const Color(0xFFE0F2FE),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: primary.withOpacity(0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.visibility_outlined,
                          size: 12,
                          color: primary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Xem KH',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Staff Card Widget ──────────────────────────────────────────────────────
class _StaffCard extends StatelessWidget {
  final StaffModel staff;
  final bool isDark;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _StaffCard({
    required this.staff,
    required this.isDark,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final cardBg = isDark ? const Color(0xFF1F1F1F) : Colors.white;
    final cardBorder = isDark
        ? const Color(0xFF333333)
        : const Color(0xFFCBD5E1);
    final textPrimary = isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF334155);
    final primary = const Color(0xFF0284C7);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: isDark
                      ? const Color(0x330284C7)
                      : const Color(0xFFE0F2FE),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    staff.fullName.isNotEmpty
                        ? staff.fullName[0].toUpperCase()
                        : 'N',
                    style: TextStyle(
                      color: primary,
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      staff.fullName,
                      style: GoogleFonts.inter(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: isDark
                            ? const Color(0x330284C7)
                            : const Color(0xFFE0F2FE),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        staff.roleLabel,
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: onEdit,
                icon: Icon(Icons.edit_outlined, color: textSecondary, size: 18),
                constraints: const BoxConstraints(),
                padding: const EdgeInsets.all(6),
                tooltip: 'Sửa',
              ),
              const SizedBox(width: 4),
              IconButton(
                onPressed: onDelete,
                icon: const Icon(
                  Icons.delete_outline_rounded,
                  color: Color(0xFFEF4444),
                  size: 18,
                ),
                constraints: const BoxConstraints(),
                padding: const EdgeInsets.all(6),
                tooltip: 'Xóa',
              ),
            ],
          ),
          const SizedBox(height: 10),
          Divider(color: cardBorder, height: 1),
          const SizedBox(height: 10),

          Row(
            children: [
              Icon(Icons.email_outlined, size: 13, color: textSecondary),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  staff.email,
                  style: GoogleFonts.inter(fontSize: 12, color: textSecondary),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),

          Row(
            children: [
              Icon(Icons.phone_outlined, size: 13, color: textSecondary),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  staff.phone.isNotEmpty ? staff.phone : 'Chưa cập nhật SĐT',
                  style: GoogleFonts.inter(fontSize: 12, color: textSecondary),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Order Card Widget ───────────────────────────────────────────────────────
class _OrderCard extends StatelessWidget {
  final OrderModel order;
  final bool isDark;
  final VoidCallback onApprove;
  final VoidCallback onViewDetails;

  const _OrderCard({
    required this.order,
    required this.isDark,
    required this.onApprove,
    required this.onViewDetails,
  });

  @override
  Widget build(BuildContext context) {
    final cardBg = isDark ? const Color(0xFF1F1F1F) : Colors.white;
    final cardBorder = isDark
        ? const Color(0xFF333333)
        : const Color(0xFFCBD5E1);
    final textPrimary = isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF334155);
    final primary = const Color(0xFF0284C7);

    final isPending = order.status == 'pending';
    final statusColor = isPending
        ? const Color(0xFFD97706)
        : const Color(0xFF16A34A);
    final statusBg = isPending
        ? (isDark ? const Color(0x33D97706) : const Color(0xFFFEF3C7))
        : (isDark ? const Color(0x3316A34A) : const Color(0xFFDCFCE7));

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                '#${order.id}',
                style: GoogleFonts.firaCode(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: primary,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  order.statusLabel,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: statusColor,
                  ),
                ),
              ),
              const Spacer(),
              Text(
                '${order.createdAt.day}/${order.createdAt.month}/${order.createdAt.year}',
                style: GoogleFonts.inter(fontSize: 11, color: textSecondary),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Divider(color: cardBorder, height: 1),
          const SizedBox(height: 10),

          Row(
            children: [
              Icon(
                Icons.person_outline_rounded,
                size: 14,
                color: textSecondary,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  '${order.customerName} (${order.phone})',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),

          Row(
            children: [
              Icon(Icons.shopping_bag_outlined, size: 14, color: textSecondary),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  order.productSummary,
                  style: GoogleFonts.inter(
                    fontSize: 12.5,
                    color: textSecondary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isDark
                      ? const Color(0xFF28282B)
                      : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: cardBorder),
                ),
                child: Text(
                  order.paymentMethod,
                  style: GoogleFonts.inter(fontSize: 11, color: textSecondary),
                ),
              ),
              Text(
                '${order.totalPrice.toStringAsFixed(0)} ₫',
                style: GoogleFonts.inter(
                  fontSize: 14.5,
                  fontWeight: FontWeight.w800,
                  color: isDark
                      ? const Color(0xFF4ADE80)
                      : const Color(0xFF16A34A),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              OutlinedButton(
                onPressed: onViewDetails,
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: cardBorder),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
                child: Text(
                  'Chi tiết',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: primary,
                  ),
                ),
              ),
              if (isPending) ...[
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: onApprove,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0284C7),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 6,
                    ),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(6),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    'Duyệt đơn',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Param Badge Widget ────────────────────────────────────────────────────
class _ParamBadge extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final bool isDark;

  const _ParamBadge({
    required this.label,
    required this.value,
    required this.icon,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final bg = isDark ? const Color(0xFF28282B) : const Color(0xFFF1F5F9);
    final border = isDark ? const Color(0xFF333333) : const Color(0xFFCBD5E1);
    final textPrimary = isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 12, color: textSecondary),
              const SizedBox(width: 4),
              Text(
                label,
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Species Form BottomSheet ────────────────────────────────────────────────
class _SpeciesFormSheet extends StatefulWidget {
  final FishSpecies? species;
  final bool isDark;
  final Function(Map<String, dynamic>) onSave;

  const _SpeciesFormSheet({
    this.species,
    required this.isDark,
    required this.onSave,
  });

  @override
  State<_SpeciesFormSheet> createState() => _SpeciesFormSheetState();
}

class _SpeciesFormSheetState extends State<_SpeciesFormSheet> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameCtrl;
  late TextEditingController _tempMinCtrl;
  late TextEditingController _tempMaxCtrl;
  late TextEditingController _phMinCtrl;
  late TextEditingController _phMaxCtrl;
  late TextEditingController _tdsMinCtrl;
  late TextEditingController _tdsMaxCtrl;

  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final sp = widget.species;
    _nameCtrl = TextEditingController(text: sp?.speciesName ?? '');
    _tempMinCtrl = TextEditingController(
      text: (sp?.tempMin ?? 24.0).toString(),
    );
    _tempMaxCtrl = TextEditingController(
      text: (sp?.tempMax ?? 30.0).toString(),
    );
    _phMinCtrl = TextEditingController(text: (sp?.phMin ?? 6.5).toString());
    _phMaxCtrl = TextEditingController(text: (sp?.phMax ?? 7.5).toString());
    _tdsMinCtrl = TextEditingController(text: (sp?.tdsMin ?? 100.0).toString());
    _tdsMaxCtrl = TextEditingController(text: (sp?.tdsMax ?? 300.0).toString());
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _tempMinCtrl.dispose();
    _tempMaxCtrl.dispose();
    _phMinCtrl.dispose();
    _phMaxCtrl.dispose();
    _tdsMinCtrl.dispose();
    _tdsMaxCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final tempMin = double.parse(_tempMinCtrl.text);
    final tempMax = double.parse(_tempMaxCtrl.text);
    if (tempMin > tempMax) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Nhiệt độ tối thiểu phải nhỏ hơn tối đa!'),
        ),
      );
      return;
    }

    final phMin = double.parse(_phMinCtrl.text);
    final phMax = double.parse(_phMaxCtrl.text);
    if (phMin > phMax) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('pH tối thiểu phải nhỏ hơn tối đa!')),
      );
      return;
    }

    final tdsMin = double.parse(_tdsMinCtrl.text);
    final tdsMax = double.parse(_tdsMaxCtrl.text);
    if (tdsMin > tdsMax) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('TDS tối thiểu phải nhỏ hơn tối đa!')),
      );
      return;
    }

    setState(() => _isSaving = true);
    final data = {
      'species_name': _nameCtrl.text.trim(),
      'temp_min': tempMin,
      'temp_max': tempMax,
      'ph_min': phMin,
      'ph_max': phMax,
      'tds_min': tdsMin,
      'tds_max': tdsMax,
    };

    await widget.onSave(data);
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = widget.isDark;
    final modalBg = isDark ? const Color(0xFF222225) : Colors.white;
    final inputBg = isDark ? const Color(0xFF181818) : Colors.white;
    final textPrimary = isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);
    final border = isDark ? const Color(0xFF333333) : const Color(0xFFCBD5E1);

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: modalBg,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      widget.species == null
                          ? 'Thêm loài cá mới'
                          : 'Chỉnh sửa loài cá',
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(
                        Icons.close_rounded,
                        color: textSecondary,
                        size: 20,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                _buildLabel('Tên loài cá', textPrimary),
                TextFormField(
                  controller: _nameCtrl,
                  style: GoogleFonts.inter(color: textPrimary, fontSize: 13.5),
                  validator: (v) => (v == null || v.trim().isEmpty)
                      ? 'Vui lòng nhập tên loài cá'
                      : null,
                  decoration: _buildInputDeco(
                    'Ví dụ: Cá Koi, Cá Betta...',
                    inputBg,
                    border,
                    textSecondary,
                  ),
                ),
                const SizedBox(height: 14),

                _buildLabel('Nhiệt độ (°C)', textPrimary),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _tempMinCtrl,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        style: GoogleFonts.inter(
                          color: textPrimary,
                          fontSize: 13.5,
                        ),
                        validator: (v) =>
                            (v == null || v.isEmpty) ? 'Thiếu min' : null,
                        decoration: _buildInputDeco(
                          'Min (24.0)',
                          inputBg,
                          border,
                          textSecondary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextFormField(
                        controller: _tempMaxCtrl,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        style: GoogleFonts.inter(
                          color: textPrimary,
                          fontSize: 13.5,
                        ),
                        validator: (v) =>
                            (v == null || v.isEmpty) ? 'Thiếu max' : null,
                        decoration: _buildInputDeco(
                          'Max (30.0)',
                          inputBg,
                          border,
                          textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                _buildLabel('Độ pH chuẩn', textPrimary),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _phMinCtrl,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        style: GoogleFonts.inter(
                          color: textPrimary,
                          fontSize: 13.5,
                        ),
                        validator: (v) =>
                            (v == null || v.isEmpty) ? 'Thiếu min' : null,
                        decoration: _buildInputDeco(
                          'Min (6.5)',
                          inputBg,
                          border,
                          textSecondary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextFormField(
                        controller: _phMaxCtrl,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        style: GoogleFonts.inter(
                          color: textPrimary,
                          fontSize: 13.5,
                        ),
                        validator: (v) =>
                            (v == null || v.isEmpty) ? 'Thiếu max' : null,
                        decoration: _buildInputDeco(
                          'Max (7.5)',
                          inputBg,
                          border,
                          textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                _buildLabel('Chỉ số TDS (ppm)', textPrimary),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _tdsMinCtrl,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        style: GoogleFonts.inter(
                          color: textPrimary,
                          fontSize: 13.5,
                        ),
                        validator: (v) =>
                            (v == null || v.isEmpty) ? 'Thiếu min' : null,
                        decoration: _buildInputDeco(
                          'Min (100)',
                          inputBg,
                          border,
                          textSecondary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextFormField(
                        controller: _tdsMaxCtrl,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        style: GoogleFonts.inter(
                          color: textPrimary,
                          fontSize: 13.5,
                        ),
                        validator: (v) =>
                            (v == null || v.isEmpty) ? 'Thiếu max' : null,
                        decoration: _buildInputDeco(
                          'Max (300)',
                          inputBg,
                          border,
                          textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: ElevatedButton(
                    onPressed: _isSaving ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0284C7),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 0,
                    ),
                    child: _isSaving
                        ? const CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          )
                        : Text(
                            widget.species == null ? 'Thêm mới' : 'Cập nhật',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }

  InputDecoration _buildInputDeco(
    String hint,
    Color bg,
    Color border,
    Color hintColor,
  ) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.inter(color: hintColor, fontSize: 13),
      filled: true,
      fillColor: bg,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: BorderSide(color: border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: BorderSide(color: border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: Color(0xFF0284C7), width: 1.5),
      ),
    );
  }
}

// ─── Device Form BottomSheet ──────────────────────────────────────────────────
class _DeviceFormSheet extends StatefulWidget {
  final DeviceModel? device;
  final bool isDark;
  final Function(String macInput, String version) onSave;

  const _DeviceFormSheet({
    this.device,
    required this.isDark,
    required this.onSave,
  });

  @override
  State<_DeviceFormSheet> createState() => _DeviceFormSheetState();
}

class _DeviceFormSheetState extends State<_DeviceFormSheet> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _macCtrl;
  String _selectedVersion = 'V1';
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final dev = widget.device;
    _macCtrl = TextEditingController(text: dev?.macAddress ?? '');
    _selectedVersion = dev != null
        ? _normalizeVersion(dev.firmwareVersion)
        : 'V1';
  }

  String _normalizeVersion(String v) {
    final u = v.toUpperCase();
    if (u.contains('V1')) return 'V1';
    if (u.contains('V2')) return 'V2';
    if (u.contains('V3')) return 'V3';
    if (u.contains('V4')) return 'V4';
    return 'V1';
  }

  @override
  void dispose() {
    _macCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);
    await widget.onSave(_macCtrl.text.trim(), _selectedVersion);
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = widget.isDark;
    final modalBg = isDark ? const Color(0xFF222225) : Colors.white;
    final inputBg = isDark ? const Color(0xFF181818) : Colors.white;
    final textPrimary = isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);
    final border = isDark ? const Color(0xFF333333) : const Color(0xFFCBD5E1);

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: modalBg,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      widget.device == null
                          ? 'Thêm thiết bị vào kho'
                          : 'Chỉnh sửa thiết bị',
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(
                        Icons.close_rounded,
                        color: textSecondary,
                        size: 20,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                _buildLabel(
                  'MAC Address (Nhập 1 hoặc nhiều mã cách nhau bằng dòng mới/dấu phẩy)',
                  textPrimary,
                ),
                TextFormField(
                  controller: _macCtrl,
                  maxLines: widget.device == null ? 3 : 1,
                  style: GoogleFonts.firaCode(color: textPrimary, fontSize: 13),
                  validator: (v) => (v == null || v.trim().isEmpty)
                      ? 'Vui lòng nhập MAC Address'
                      : null,
                  decoration: InputDecoration(
                    hintText: widget.device == null
                        ? 'Ví dụ:\n83:BC:5C:AD:72:AA\n83:BC:5C:AD:72:AB'
                        : 'Ví dụ: 83:BC:5C:AD:72:AA',
                    hintStyle: GoogleFonts.firaCode(
                      color: textSecondary,
                      fontSize: 12,
                    ),
                    filled: true,
                    fillColor: inputBg,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 12,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(6),
                      borderSide: BorderSide(color: border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(6),
                      borderSide: BorderSide(color: border),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(6),
                      borderSide: const BorderSide(
                        color: Color(0xFF0284C7),
                        width: 1.5,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                _buildLabel(
                  'Phiên bản thiết bị (Firmware Version)',
                  textPrimary,
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: inputBg,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: border),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedVersion,
                      isExpanded: true,
                      dropdownColor: isDark
                          ? const Color(0xFF222225)
                          : Colors.white,
                      style: GoogleFonts.inter(
                        color: textPrimary,
                        fontSize: 13.5,
                        fontWeight: FontWeight.w600,
                      ),
                      onChanged: (val) {
                        if (val != null) {
                          setState(() => _selectedVersion = val);
                        }
                      },
                      items: const [
                        DropdownMenuItem(
                          value: 'V1',
                          child: Text('Phiên bản V1 (Cơ bản)'),
                        ),
                        DropdownMenuItem(
                          value: 'V2',
                          child: Text('Phiên bản V2 (Bổ sung pH)'),
                        ),
                        DropdownMenuItem(
                          value: 'V3',
                          child: Text('Phiên bản V3 (Bổ sung TDS)'),
                        ),
                        DropdownMenuItem(
                          value: 'V4',
                          child: Text('Phiên bản V4 (Cao cấp)'),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: ElevatedButton(
                    onPressed: _isSaving ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0284C7),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 0,
                    ),
                    child: _isSaving
                        ? const CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          )
                        : Text(
                            widget.device == null
                                ? 'Thêm thiết bị'
                                : 'Cập nhật',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

// ─── Staff Form BottomSheet ──────────────────────────────────────────────────
class _StaffFormSheet extends StatefulWidget {
  final StaffModel? staff;
  final bool isDark;
  final Function(
    String fullName,
    String email,
    String phone,
    String password,
    String role,
  )
  onSave;

  const _StaffFormSheet({
    this.staff,
    required this.isDark,
    required this.onSave,
  });

  @override
  State<_StaffFormSheet> createState() => _StaffFormSheetState();
}

class _StaffFormSheetState extends State<_StaffFormSheet> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameCtrl;
  late TextEditingController _emailCtrl;
  late TextEditingController _phoneCtrl;
  late TextEditingController _passCtrl;
  String _selectedRole = 'staff_warehouse';
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final st = widget.staff;
    _nameCtrl = TextEditingController(text: st?.fullName ?? '');
    _emailCtrl = TextEditingController(text: st?.email ?? '');
    _phoneCtrl = TextEditingController(text: st?.phone ?? '');
    _passCtrl = TextEditingController();
    _selectedRole = st?.role ?? 'staff_warehouse';
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);
    await widget.onSave(
      _nameCtrl.text.trim(),
      _emailCtrl.text.trim(),
      _phoneCtrl.text.trim(),
      _passCtrl.text,
      _selectedRole,
    );
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = widget.isDark;
    final modalBg = isDark ? const Color(0xFF222225) : Colors.white;
    final inputBg = isDark ? const Color(0xFF181818) : Colors.white;
    final textPrimary = isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);
    final border = isDark ? const Color(0xFF333333) : const Color(0xFFCBD5E1);

    final isEdit = widget.staff != null;

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: modalBg,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isEdit ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới',
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(
                        Icons.close_rounded,
                        color: textSecondary,
                        size: 20,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                _buildLabel('Họ và tên', textPrimary),
                TextFormField(
                  controller: _nameCtrl,
                  style: GoogleFonts.inter(color: textPrimary, fontSize: 13.5),
                  validator: (v) => (v == null || v.trim().isEmpty)
                      ? 'Vui lòng nhập họ tên'
                      : null,
                  decoration: _buildInputDeco(
                    'Ví dụ: Nguyễn Văn A',
                    inputBg,
                    border,
                    textSecondary,
                  ),
                ),
                const SizedBox(height: 14),

                _buildLabel('Email tài khoản', textPrimary),
                TextFormField(
                  controller: _emailCtrl,
                  enabled: !isEdit,
                  keyboardType: TextInputType.emailAddress,
                  style: GoogleFonts.inter(color: textPrimary, fontSize: 13.5),
                  validator: (v) =>
                      (!isEdit &&
                          (v == null || v.trim().isEmpty || !v.contains('@')))
                      ? 'Vui lòng nhập Email hợp lệ'
                      : null,
                  decoration: _buildInputDeco(
                    'Ví dụ: nhanvien@aquacare.com',
                    inputBg,
                    border,
                    textSecondary,
                  ),
                ),
                const SizedBox(height: 14),

                _buildLabel('Số điện thoại', textPrimary),
                TextFormField(
                  controller: _phoneCtrl,
                  keyboardType: TextInputType.phone,
                  style: GoogleFonts.inter(color: textPrimary, fontSize: 13.5),
                  validator: (v) => (v == null || v.trim().isEmpty)
                      ? 'Vui lòng nhập số điện thoại'
                      : null,
                  decoration: _buildInputDeco(
                    'Ví dụ: 0987654321',
                    inputBg,
                    border,
                    textSecondary,
                  ),
                ),
                const SizedBox(height: 14),

                if (!isEdit) ...[
                  _buildLabel('Mật khẩu khởi tạo', textPrimary),
                  TextFormField(
                    controller: _passCtrl,
                    obscureText: true,
                    style: GoogleFonts.inter(
                      color: textPrimary,
                      fontSize: 13.5,
                    ),
                    validator: (v) => (!isEdit && (v == null || v.length < 6))
                        ? 'Mật khẩu ít nhất 6 ký tự'
                        : null,
                    decoration: _buildInputDeco(
                      'Mật khẩu đăng nhập',
                      inputBg,
                      border,
                      textSecondary,
                    ),
                  ),
                  const SizedBox(height: 14),
                ],

                _buildLabel('Chức vụ / Vai trò', textPrimary),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: inputBg,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: border),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedRole,
                      isExpanded: true,
                      dropdownColor: isDark
                          ? const Color(0xFF222225)
                          : Colors.white,
                      style: GoogleFonts.inter(
                        color: textPrimary,
                        fontSize: 13.5,
                        fontWeight: FontWeight.w600,
                      ),
                      onChanged: (val) {
                        if (val != null) {
                          setState(() => _selectedRole = val);
                        }
                      },
                      items: const [
                        DropdownMenuItem(
                          value: 'staff_warehouse',
                          child: Text('Nhân viên kho'),
                        ),
                        DropdownMenuItem(
                          value: 'staff_shipper',
                          child: Text('Nhân viên giao hàng'),
                        ),
                        DropdownMenuItem(
                          value: 'staff_support',
                          child: Text('Nhân viên hỗ trợ'),
                        ),
                        DropdownMenuItem(
                          value: 'staff_maintenance',
                          child: Text('Nhân viên bảo trì'),
                        ),
                        DropdownMenuItem(value: 'staff', child: Text('Staff')),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: ElevatedButton(
                    onPressed: _isSaving ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0284C7),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 0,
                    ),
                    child: _isSaving
                        ? const CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          )
                        : Text(
                            isEdit ? 'Cập nhật nhân viên' : 'Tạo nhân viên',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }

  InputDecoration _buildInputDeco(
    String hint,
    Color bg,
    Color border,
    Color hintColor,
  ) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.inter(color: hintColor, fontSize: 13),
      filled: true,
      fillColor: bg,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: BorderSide(color: border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: BorderSide(color: border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: Color(0xFF0284C7), width: 1.5),
      ),
    );
  }
}

// ─── Subscription Card Widget ─────────────────────────────────────────────
class _SubscriptionCard extends StatelessWidget {
  final SubscriptionPlanModel plan;
  final bool isDark;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _SubscriptionCard({
    required this.plan,
    required this.isDark,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final cardBg = isDark ? const Color(0xFF1F1F1F) : Colors.white;
    final cardBorder = isDark
        ? const Color(0xFF333333)
        : const Color(0xFFCBD5E1);
    final textPrimary = isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF334155);
    final primary = const Color(0xFF0284C7);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: isDark
                      ? const Color(0x330284C7)
                      : const Color(0xFFE0F2FE),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Icon(Icons.layers_outlined, color: primary, size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  plan.name,
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: textPrimary,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isDark
                      ? const Color(0xFF28282B)
                      : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: cardBorder),
                ),
                child: Text(
                  plan.planTypeLabel,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: primary,
                  ),
                ),
              ),
              const SizedBox(width: 6),
              IconButton(
                onPressed: onEdit,
                icon: Icon(Icons.edit_outlined, color: textSecondary, size: 18),
                constraints: const BoxConstraints(),
                padding: const EdgeInsets.all(4),
                tooltip: 'Sửa',
              ),
              const SizedBox(width: 2),
              IconButton(
                onPressed: onDelete,
                icon: const Icon(
                  Icons.delete_outline_rounded,
                  color: Color(0xFFEF4444),
                  size: 18,
                ),
                constraints: const BoxConstraints(),
                padding: const EdgeInsets.all(4),
                tooltip: 'Xóa',
              ),
            ],
          ),
          const SizedBox(height: 10),

          Row(
            children: [
              Text(
                '${plan.price.toStringAsFixed(0)} ₫',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: isDark
                      ? const Color(0xFF4ADE80)
                      : const Color(0xFF16A34A),
                ),
              ),
              Text(
                ' / ${plan.durationMonths} tháng',
                style: GoogleFonts.inter(fontSize: 12, color: textSecondary),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Divider(color: cardBorder, height: 1),
          const SizedBox(height: 10),

          Row(
            children: [
              Expanded(
                child: _ParamBadge(
                  label: 'Số bể tối đa',
                  value: '${plan.maxTanks} bể',
                  icon: Icons.water_outlined,
                  isDark: isDark,
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: _ParamBadge(
                  label: 'Lưu lịch sử',
                  value: '${plan.historyDays} ngày',
                  icon: Icons.history_rounded,
                  isDark: isDark,
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: _ParamBadge(
                  label: 'Setup Thiết bị',
                  value: plan.smartDeviceSetup ? 'Có' : 'Không',
                  icon: Icons.settings_remote_outlined,
                  isDark: isDark,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Subscription Form Sheet ──────────────────────────────────────────────
class _SubscriptionFormSheet extends StatefulWidget {
  final SubscriptionPlanModel? plan;
  final bool isDark;
  final Function(Map<String, dynamic>) onSave;

  const _SubscriptionFormSheet({
    this.plan,
    required this.isDark,
    required this.onSave,
  });

  @override
  State<_SubscriptionFormSheet> createState() => _SubscriptionFormSheetState();
}

class _SubscriptionFormSheetState extends State<_SubscriptionFormSheet> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameCtrl;
  late TextEditingController _priceCtrl;
  late TextEditingController _durationCtrl;
  late TextEditingController _maxTanksCtrl;
  late TextEditingController _historyDaysCtrl;
  String _selectedPlanType = 'premium';
  bool _smartDeviceSetup = true;

  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final p = widget.plan;
    _nameCtrl = TextEditingController(text: p?.name ?? '');
    _priceCtrl = TextEditingController(
      text: (p?.price.toInt() ?? 80000).toString(),
    );
    _durationCtrl = TextEditingController(
      text: (p?.durationMonths ?? 1).toString(),
    );
    _maxTanksCtrl = TextEditingController(text: (p?.maxTanks ?? 5).toString());
    _historyDaysCtrl = TextEditingController(
      text: (p?.historyDays ?? 365).toString(),
    );
    _selectedPlanType = p?.planType ?? 'premium';
    _smartDeviceSetup = p?.smartDeviceSetup ?? true;
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _priceCtrl.dispose();
    _durationCtrl.dispose();
    _maxTanksCtrl.dispose();
    _historyDaysCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    final data = {
      'name': _nameCtrl.text.trim(),
      'plan_type': _selectedPlanType,
      'price': double.tryParse(_priceCtrl.text) ?? 0.0,
      'duration_months': int.tryParse(_durationCtrl.text) ?? 1,
      'max_tanks': int.tryParse(_maxTanksCtrl.text) ?? 1,
      'smart_device_setup': _smartDeviceSetup,
      'history_days': int.tryParse(_historyDaysCtrl.text) ?? 30,
    };

    await widget.onSave(data);
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = widget.isDark;
    final modalBg = isDark ? const Color(0xFF222225) : Colors.white;
    final inputBg = isDark ? const Color(0xFF181818) : Colors.white;
    final textPrimary = isDark
        ? const Color(0xFFF4F4F5)
        : const Color(0xFF0F172A);
    final textSecondary = isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF475569);
    final border = isDark ? const Color(0xFF333333) : const Color(0xFFCBD5E1);

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: modalBg,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      widget.plan == null
                          ? 'Thêm gói cước mới'
                          : 'Sửa gói cước',
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(
                        Icons.close_rounded,
                        color: textSecondary,
                        size: 20,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                _buildLabel('Tên gói cước', textPrimary),
                TextFormField(
                  controller: _nameCtrl,
                  style: GoogleFonts.inter(color: textPrimary, fontSize: 13.5),
                  validator: (v) => (v == null || v.trim().isEmpty)
                      ? 'Vui lòng nhập tên gói cước'
                      : null,
                  decoration: _buildInputDeco(
                    'Ví dụ: Gói Siêu Cấp',
                    inputBg,
                    border,
                    textSecondary,
                  ),
                ),
                const SizedBox(height: 14),

                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildLabel('Loại gói', textPrimary),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: inputBg,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: border),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: _selectedPlanType,
                                isExpanded: true,
                                dropdownColor: isDark
                                    ? const Color(0xFF1F1F1F)
                                    : Colors.white,
                                style: GoogleFonts.inter(
                                  color: textPrimary,
                                  fontSize: 13,
                                ),
                                items: const [
                                  DropdownMenuItem(
                                    value: 'free',
                                    child: Text('Miễn phí'),
                                  ),
                                  DropdownMenuItem(
                                    value: 'premium',
                                    child: Text('Cao cấp (Premium)'),
                                  ),
                                  DropdownMenuItem(
                                    value: 'enterprise',
                                    child: Text('Doanh nghiệp'),
                                  ),
                                ],
                                onChanged: (v) {
                                  if (v != null)
                                    setState(() => _selectedPlanType = v);
                                },
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildLabel('Giá cước (VNĐ)', textPrimary),
                          TextFormField(
                            controller: _priceCtrl,
                            keyboardType: TextInputType.number,
                            style: GoogleFonts.inter(
                              color: textPrimary,
                              fontSize: 13.5,
                            ),
                            validator: (v) =>
                                (v == null || v.isEmpty) ? 'Nhập giá' : null,
                            decoration: _buildInputDeco(
                              '80000',
                              inputBg,
                              border,
                              textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildLabel('Thời hạn (Tháng)', textPrimary),
                          TextFormField(
                            controller: _durationCtrl,
                            keyboardType: TextInputType.number,
                            style: GoogleFonts.inter(
                              color: textPrimary,
                              fontSize: 13.5,
                            ),
                            validator: (v) =>
                                (v == null || v.isEmpty) ? 'Nhập tháng' : null,
                            decoration: _buildInputDeco(
                              '1',
                              inputBg,
                              border,
                              textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildLabel('Số bể tối đa', textPrimary),
                          TextFormField(
                            controller: _maxTanksCtrl,
                            keyboardType: TextInputType.number,
                            style: GoogleFonts.inter(
                              color: textPrimary,
                              fontSize: 13.5,
                            ),
                            validator: (v) =>
                                (v == null || v.isEmpty) ? 'Nhập số bể' : null,
                            decoration: _buildInputDeco(
                              '5',
                              inputBg,
                              border,
                              textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                _buildLabel('Lưu trữ lịch sử (Ngày)', textPrimary),
                TextFormField(
                  controller: _historyDaysCtrl,
                  keyboardType: TextInputType.number,
                  style: GoogleFonts.inter(color: textPrimary, fontSize: 13.5),
                  validator: (v) =>
                      (v == null || v.isEmpty) ? 'Nhập số ngày' : null,
                  decoration: _buildInputDeco(
                    '365',
                    inputBg,
                    border,
                    textSecondary,
                  ),
                ),
                const SizedBox(height: 14),

                CheckboxListTile(
                  title: Text(
                    'Setup Thiết bị thông minh',
                    style: GoogleFonts.inter(fontSize: 13, color: textPrimary),
                  ),
                  value: _smartDeviceSetup,
                  activeColor: const Color(0xFF0284C7),
                  contentPadding: EdgeInsets.zero,
                  controlAffinity: ListTileControlAffinity.leading,
                  onChanged: (v) =>
                      setState(() => _smartDeviceSetup = v ?? false),
                ),
                const SizedBox(height: 20),

                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: ElevatedButton(
                    onPressed: _isSaving ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0284C7),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 0,
                    ),
                    child: _isSaving
                        ? const CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          )
                        : Text(
                            widget.plan == null
                                ? 'Tạo gói cước'
                                : 'Cập nhật gói cước',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }

  InputDecoration _buildInputDeco(
    String hint,
    Color bg,
    Color border,
    Color hintColor,
  ) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.inter(color: hintColor, fontSize: 13),
      filled: true,
      fillColor: bg,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: BorderSide(color: border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: BorderSide(color: border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: Color(0xFF0284C7), width: 1.5),
      ),
    );
  }
}
