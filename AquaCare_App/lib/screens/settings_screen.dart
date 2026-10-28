import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../customer_theme.dart';
import 'login_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _isLoggingOut = false;
  Map<String, dynamic>? _userInfo;
  String _appVersion = '1.0.6';
  String _buildNumber = '7';

  @override
  void initState() {
    super.initState();
    _loadUserInfo();
    _loadAppVersion();
  }

  Future<void> _loadUserInfo() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final infoStr = prefs.getString('user_info');
      Map<String, dynamic> info = {};
      if (infoStr != null && infoStr.isNotEmpty) {
        info = jsonDecode(infoStr);
      }

      final authUser = Supabase.instance.client.auth.currentUser;
      if (authUser != null) {
        if (info['email'] == null || info['email'].toString().isEmpty) {
          info['email'] = authUser.email ?? '';
        }
        if (info['id'] == null) {
          info['id'] = authUser.id;
        }

        // Truy vấn bảng users để lấy thông tin mới nhất nếu thiếu
        try {
          final dbUser = await Supabase.instance.client
              .from('users')
              .select('full_name, phone, role, avatar_url')
              .eq('id', authUser.id)
              .maybeSingle();
          if (dbUser != null) {
            info['full_name'] = dbUser['full_name'] ?? info['full_name'];
            info['phone'] = dbUser['phone'] ?? info['phone'];
            info['role'] = dbUser['role'] ?? info['role'];
            info['avatar_url'] = dbUser['avatar_url'] ?? info['avatar_url'];
          }
        } catch (e) {
          debugPrint('Không thể tải profile từ DB: $e');
        }
      }

      if (mounted) {
        setState(() {
          _userInfo = info;
        });
      }
    } catch (e) {
      debugPrint('Lỗi tải thông tin user: $e');
    }
  }

  Future<void> _loadAppVersion() async {
    try {
      final packageInfo = await PackageInfo.fromPlatform();
      if (mounted) {
        setState(() {
          _appVersion = packageInfo.version;
          _buildNumber = packageInfo.buildNumber;
        });
      }
    } catch (e) {
      debugPrint('Lỗi lấy thông tin phiên bản: $e');
    }
  }

  String _getInitials(String? name) {
    if (name == null || name.trim().isEmpty) return 'A';
    final words = name.trim().split(RegExp(r'\s+'));
    if (words.length >= 2) {
      return (words.first[0] + words.last[0]).toUpperCase();
    }
    return words.first[0].toUpperCase();
  }

  Future<void> _launchExternalUrl(String urlString) async {
    try {
      final uri = Uri.parse(urlString);
      final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!opened && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không thể mở liên kết này.')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $e')),
        );
      }
    }
  }

  void _showSupportDialog() {
    showCustomerDialog(
      context: context,
      barrierColor: Colors.black.withValues(alpha: 0.6),
      builder: (ctx) => AlertDialog(
        backgroundColor: CustomerColors.card,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: BorderSide(
            color: CustomerColors.border.withValues(alpha: 0.3),
            width: 1,
          ),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: CustomerColors.accentText.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                Icons.support_agent_rounded,
                color: CustomerColors.accentText,
                size: 24,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Trung tâm hỗ trợ',
                style: GoogleFonts.inter(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: CustomerColors.text,
                ),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Đội ngũ kỹ thuật AquaCare luôn sẵn sàng hỗ trợ bạn theo dõi và vận hành hệ thống hồ thủy sinh thông minh.',
              style: GoogleFonts.inter(
                fontSize: 13,
                color: CustomerColors.secondaryText,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 16),
            _buildContactRow(
              icon: Icons.phone_in_talk_rounded,
              title: 'Hotline kỹ thuật',
              detail: '0902943981 (8:00 - 20:00)',
              color: const Color(0xFF38B2AC),
              onTap: () => _launchExternalUrl('tel:0902943981'),
            ),
            const SizedBox(height: 12),
            _buildContactRow(
              icon: Icons.email_outlined,
              title: 'Email hỗ trợ',
              detail: 'phamlenhatminh1609@gmail.com',
              color: const Color(0xFF4299E1),
              onTap: () => _launchExternalUrl('mailto:phamlenhatminh1609@gmail.com'),
            ),
            const SizedBox(height: 12),
            _buildContactRow(
              icon: Icons.language_rounded,
              title: 'Website chính thức',
              detail: 'aquacare.vn',
              color: const Color(0xFF9F7AEA),
              onTap: () => _launchExternalUrl('https://aqua-care2.vercel.app/'),
            ),
          ],
        ),
        actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            style: ElevatedButton.styleFrom(
              backgroundColor: CustomerColors.accentText,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              elevation: 0,
            ),
            child: Text(
              'Đóng',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactRow({
    required IconData icon,
    required String title,
    required String detail,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: CustomerColors.background,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: CustomerColors.border.withValues(alpha: 0.15),
          ),
        ),
        child: Row(
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: CustomerColors.mutedText,
                    ),
                  ),
                  Text(
                    detail,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: CustomerColors.text,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.open_in_new_rounded,
              size: 16,
              color: CustomerColors.secondaryText,
            ),
          ],
        ),
      ),
    );
  }

  void _handleLogout() {
    showCustomerDialog(
      context: context,
      barrierColor: Colors.black.withValues(alpha: 0.6),
      builder: (ctx) => AlertDialog(
        backgroundColor: CustomerColors.card,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: CustomerColors.text.withValues(alpha: 0.08),
            width: 1,
          ),
        ),
        title: Text(
          'Đăng xuất',
          style: GoogleFonts.inter(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: CustomerColors.text,
          ),
        ),
        content: Text(
          'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
          style: GoogleFonts.inter(
            fontSize: 13,
            color: CustomerColors.secondaryText,
            height: 1.5,
          ),
        ),
        actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            style: TextButton.styleFrom(
              foregroundColor: CustomerColors.secondaryText,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: Text(
              'Hủy',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              setState(() => _isLoggingOut = true);
              try {
                await Supabase.instance.client.auth.signOut();
                final prefs = await SharedPreferences.getInstance();
                await prefs.remove('access_token');
                await prefs.remove('refresh_token');
                await prefs.remove('role');
                await prefs.remove('user_info');
                await prefs.setBool('remember_login', false);
              } catch (e) {
                debugPrint('Lỗi đăng xuất: $e');
              }
              if (mounted) {
                Navigator.pushAndRemoveUntil(
                  context,
                  PageRouteBuilder(
                    pageBuilder: (_, _, _) => const LoginScreen(),
                    transitionsBuilder: (_, anim, _, child) =>
                        FadeTransition(opacity: anim, child: child),
                    transitionDuration: const Duration(milliseconds: 350),
                  ),
                  (route) => false,
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF6B6B),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              elevation: 0,
            ),
            child: Text(
              'Đăng xuất',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final avatarUrl = _userInfo?['avatar_url']?.toString();
    final fullName = _userInfo?['full_name']?.toString() ?? 'Người dùng AquaCare';
    final email = _userInfo?['email']?.toString() ?? 'Chưa cập nhật email';
    final phone = _userInfo?['phone']?.toString();
    final role = _userInfo?['role']?.toString() ?? 'Khách hàng';

    return ListenableBuilder(
      listenable: CustomerTheme.mode,
      builder: (context, _) {
        return Scaffold(
          backgroundColor: CustomerColors.background,
          appBar: AppBar(
            backgroundColor: CustomerColors.card,
            elevation: 0,
            centerTitle: false,
            leading: IconButton(
              icon: Icon(
                Icons.arrow_back_ios_new_rounded,
                size: 20,
                color: CustomerColors.text,
              ),
              onPressed: () => Navigator.pop(context),
            ),
            title: Text(
              'Cài đặt',
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: CustomerColors.text,
              ),
            ),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(1),
              child: Container(
                color: CustomerColors.border.withValues(alpha: 0.2),
                height: 1,
              ),
            ),
          ),
          body: SafeArea(
            child: _isLoggingOut
                ? Center(
                    child: CircularProgressIndicator(
                      color: CustomerColors.accentText,
                    ),
                  )
                : ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                    children: [
                      // ── 1. THÔNG TIN NGƯỜI DÙNG TỔNG QUAN ────────
                      _buildSectionHeader('TÀI KHOẢN CỦA TÔI'),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: CustomerColors.card,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(
                            color: CustomerColors.border.withValues(alpha: 0.25),
                            width: 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            // Avatar
                            Container(
                              width: 58,
                              height: 58,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: LinearGradient(
                                  colors: [
                                    CustomerColors.accentText,
                                    const Color(0xFF38B2AC),
                                  ],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                border: Border.all(
                                  color: CustomerColors.accentText.withValues(alpha: 0.4),
                                  width: 2,
                                ),
                              ),
                              child: avatarUrl != null && avatarUrl.trim().isNotEmpty
                                  ? ClipOval(
                                      child: Image.network(
                                        avatarUrl,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) => Center(
                                          child: Text(
                                            _getInitials(fullName),
                                            style: GoogleFonts.inter(
                                              fontSize: 20,
                                              fontWeight: FontWeight.w700,
                                              color: Colors.white,
                                            ),
                                          ),
                                        ),
                                      ),
                                    )
                                  : Center(
                                      child: Text(
                                        _getInitials(fullName),
                                        style: GoogleFonts.inter(
                                          fontSize: 20,
                                          fontWeight: FontWeight.w700,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                            ),
                            const SizedBox(width: 16),
                            // Thông tin chữ
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Flexible(
                                        child: Text(
                                          fullName,
                                          style: GoogleFonts.inter(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w700,
                                            color: CustomerColors.text,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 3,
                                        ),
                                        decoration: BoxDecoration(
                                          color: CustomerColors.accentText
                                              .withValues(alpha: 0.15),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          role == 'admin'
                                              ? 'Quản trị viên'
                                              : (role.startsWith('staff')
                                                  ? 'Kỹ thuật viên'
                                                  : 'Khách hàng'),
                                          style: GoogleFonts.inter(
                                            fontSize: 10,
                                            fontWeight: FontWeight.w600,
                                            color: CustomerColors.accentText,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      Icon(
                                        Icons.email_outlined,
                                        size: 13,
                                        color: CustomerColors.secondaryText,
                                      ),
                                      const SizedBox(width: 5),
                                      Expanded(
                                        child: Text(
                                          email,
                                          style: GoogleFonts.inter(
                                            fontSize: 12,
                                            color: CustomerColors.secondaryText,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                  if (phone != null && phone.trim().isNotEmpty) ...[
                                    const SizedBox(height: 3),
                                    Row(
                                      children: [
                                        Icon(
                                          Icons.phone_outlined,
                                          size: 13,
                                          color: CustomerColors.secondaryText,
                                        ),
                                        const SizedBox(width: 5),
                                        Text(
                                          phone,
                                          style: GoogleFonts.inter(
                                            fontSize: 12,
                                            color: CustomerColors.secondaryText,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // ── 2. MỤC HỖ TRỢ ─────────────────────────────
                      _buildSectionHeader('HỖ TRỢ & LIÊN HỆ'),
                      Container(
                        decoration: BoxDecoration(
                          color: CustomerColors.card,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(
                            color: CustomerColors.border.withValues(alpha: 0.25),
                            width: 1,
                          ),
                        ),
                        child: Column(
                          children: [
                            _buildSettingTile(
                              icon: Icons.support_agent_rounded,
                              iconBg: const Color(0xFF38B2AC),
                              title: 'Trung tâm hỗ trợ AquaCare',
                              subtitle: 'Hotline, email và kênh tư vấn trực tuyến',
                              onTap: _showSupportDialog,
                            ),
                            _buildDivider(),
                            _buildSettingTile(
                              icon: Icons.public_rounded,
                              iconBg: const Color(0xFF4299E1),
                              title: 'Trang web liên hệ AquaCare',
                              subtitle: 'Gửi yêu cầu hỗ trợ hoặc tìm hiểu thêm',
                              onTap: () => _launchExternalUrl('https://aqua-care2.vercel.app/'),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // ── 3. THÔNG TIN PHIÊN BẢN ───────────────────
                      _buildSectionHeader('ỨNG DỤNG'),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          color: CustomerColors.card,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(
                            color: CustomerColors.border.withValues(alpha: 0.25),
                            width: 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: const Color(0xFF9F7AEA).withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(
                                Icons.info_outline_rounded,
                                color: Color(0xFF9F7AEA),
                                size: 22,
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Thông tin phiên bản',
                                    style: GoogleFonts.inter(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: CustomerColors.text,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'AquaCare Smart Aquaculture System',
                                    style: GoogleFonts.inter(
                                      fontSize: 12,
                                      color: CustomerColors.secondaryText,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: CustomerColors.accentText.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: CustomerColors.accentText.withValues(alpha: 0.3),
                                  width: 0.8,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.check_circle_rounded,
                                    size: 13,
                                    color: Color(0xFF38B2AC),
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    'v$_appVersion',
                                    style: GoogleFonts.inter(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: CustomerColors.accentText,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // ── 4. ĐĂNG XUẤT ──────────────────────────────
                      _buildSectionHeader('TÙY CHỌN KHÁC'),
                      Container(
                        decoration: BoxDecoration(
                          color: CustomerColors.card,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(
                            color: CustomerColors.border.withValues(alpha: 0.25),
                            width: 1,
                          ),
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: _handleLogout,
                            borderRadius: BorderRadius.circular(18),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 14,
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 40,
                                    height: 40,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFF6B6B).withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: const Icon(
                                      Icons.logout_rounded,
                                      color: Color(0xFFFF6B6B),
                                      size: 22,
                                    ),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Đăng xuất',
                                          style: GoogleFonts.inter(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600,
                                            color: const Color(0xFFFF6B6B),
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          'Đăng xuất khỏi tài khoản hiện tại',
                                          style: GoogleFonts.inter(
                                            fontSize: 12,
                                            color: CustomerColors.secondaryText,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Icon(
                                    Icons.chevron_right_rounded,
                                    color: CustomerColors.secondaryText,
                                    size: 20,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 28),
                    ],
                  ),
          ),
        );
      },
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.8,
          color: CustomerColors.mutedText,
        ),
      ),
    );
  }

  Widget _buildSettingTile({
    required IconData icon,
    required Color iconBg,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
          child: Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: iconBg.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: iconBg, size: 21),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: CustomerColors.text,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: CustomerColors.secondaryText,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.chevron_right_rounded,
                color: CustomerColors.secondaryText,
                size: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDivider() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      height: 1,
      color: CustomerColors.border.withValues(alpha: 0.15),
    );
  }
}
