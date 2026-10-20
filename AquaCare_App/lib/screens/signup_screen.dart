import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'login_screen.dart' show GoogleLogoPainter;
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'dashboard_screen.dart';
import 'admin_screen.dart';
import '../config/api_config.dart';

final String apiUrl = '${ApiConfig.baseUrl}/api/auth';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _showPassword = false;
  bool _showConfirm = false;
  bool _loading = false;
  bool _agreeTerms = false;
  bool _googleLoading = false;

  late AnimationController _fadeCtrl;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _fadeCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..forward();
    _fadeAnim = CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut);
  }

  @override
  void dispose() {
    _fadeCtrl.dispose();
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _passCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  void _handleSignup() async {
    if (!_formKey.currentState!.validate()) return;

    if (!_agreeTerms) {
      _showError(
        'Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật!',
      );
      return;
    }

    if (_passCtrl.text != _confirmCtrl.text) {
      _showError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setState(() => _loading = true);

    try {
      final res = await http.post(
        Uri.parse('$apiUrl/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'fullName': _nameCtrl.text.trim(),
          'email': _emailCtrl.text.trim(),
          'phone': _phoneCtrl.text.trim(),
          'password': _passCtrl.text,
        }),
      );

      setState(() => _loading = false);
      if (!mounted) return;

      if (res.statusCode == 200) {
        _showSuccess('Tài khoản đã được tạo thành công!');
        await Future.delayed(const Duration(milliseconds: 2200));
        if (mounted) Navigator.pop(context);
      } else {
        final data = jsonDecode(res.body);
        _showError(data['error'] ?? 'Đăng ký thất bại');
      }
    } catch (e) {
      setState(() => _loading = false);
      if (!mounted) return;
      _showError('Lỗi kết nối máy chủ');
    }
  }

  Future<void> _handleGoogleAuth() async {
    setState(() => _googleLoading = true);
    try {
      final googleUser = await GoogleSignIn.instance.authenticate();

      final googleAuth = googleUser.authentication;
      final idToken = googleAuth.idToken;

      if (idToken == null) {
        throw 'Missing Google ID Token';
      }

      final AuthResponse res = await Supabase.instance.client.auth
          .signInWithIdToken(provider: OAuthProvider.google, idToken: idToken);

      final user = res.user;
      if (user == null) {
        _showError('Đăng nhập Supabase thất bại.');
        setState(() => _googleLoading = false);
        return;
      }

      // Query role
      final userData = await Supabase.instance.client
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

      String role = 'user';
      if (userData == null) {
        // Insert new user
        role = 'user';
        final fullName =
            user.userMetadata?['full_name'] ?? user.userMetadata?['name'] ?? '';
        await Supabase.instance.client.from('users').upsert({
          'id': user.id,
          'email': user.email,
          'full_name': fullName,
          'role': role,
        });
      } else {
        role = userData['role'] ?? 'user';
      }

      // Save to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('remember_login', true);
      await prefs.setString('role', role);
      await prefs.remove('refresh_token');
      await prefs.setString(
        'user_info',
        jsonEncode({
          'id': user.id,
          'email': user.email,
          'full_name':
              user.userMetadata?['full_name'] ??
              user.userMetadata?['name'] ??
              '',
          'avatar_url':
              user.userMetadata?['avatar_url'] ?? user.userMetadata?['picture'],
          'role': role,
        }),
      );
      if (res.session?.accessToken != null) {
        await prefs.setString('access_token', res.session!.accessToken);
      }
      if (res.session?.refreshToken != null) {
        await prefs.setString('refresh_token', res.session!.refreshToken!);
      }

      setState(() => _googleLoading = false);
      if (!mounted) return;

      Widget destination;
      if (role == 'admin') {
        destination = const AdminScreen();
      } else if (role.toString().startsWith('staff')) {
        destination = const StaffScreen();
      } else {
        destination = const DashboardScreen();
      }

      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (_, _, _) => destination,
          transitionsBuilder: (_, anim, _, child) =>
              FadeTransition(opacity: anim, child: child),
          transitionDuration: const Duration(milliseconds: 400),
        ),
      );
    } catch (e) {
      setState(() => _googleLoading = false);
      _showError('Lỗi đăng ký Google: $e');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        backgroundColor: const Color(0xFF1A0D0D),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: Color(0xFFFF6B6B), width: 1),
        ),
        content: Row(
          children: [
            const Icon(
              Icons.warning_rounded,
              color: Color(0xFFFF6B6B),
              size: 18,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: const Color(0xFFFF6B6B),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        backgroundColor: const Color(0xFF0A1F14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: Color(0xFF00A896), width: 1),
        ),
        content: Row(
          children: [
            const Icon(
              Icons.check_circle_outline,
              color: Color(0xFF00A896),
              size: 18,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: const Color(0xFF00A896),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final keyboardOpen = MediaQuery.viewInsetsOf(context).bottom > 0;
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        systemNavigationBarColor: Colors.white,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Column(
            children: [
              _buildTopBar(context),
              Expanded(
                child: SingleChildScrollView(
                  keyboardDismissBehavior:
                      ScrollViewKeyboardDismissBehavior.onDrag,
                  padding: const EdgeInsets.fromLTRB(28, 18, 28, 24),
                  child: FadeTransition(
                    opacity: _fadeAnim,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Tạo tài khoản',
                          style: GoogleFonts.inter(
                            fontSize: 28,
                            fontWeight: FontWeight.w800,
                            color: const Color(0xFF09213B),
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Bắt đầu chăm sóc bể cá cùng AquaCare',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: const Color(0xFF66758B),
                          ),
                        ),
                        const SizedBox(height: 30),
                        Form(
                          key: _formKey,
                          child: Column(
                            children: [
                              _buildField(
                                controller: _nameCtrl,
                                label: 'HỌ VÀ TÊN',
                                hint: 'Nguyễn Văn A',
                                icon: Icons.person_outline,
                                validator: (value) =>
                                    value == null || value.trim().isEmpty
                                    ? 'Vui lòng nhập họ tên'
                                    : null,
                              ),
                              const SizedBox(height: 19),
                              _buildField(
                                controller: _emailCtrl,
                                label: 'EMAIL',
                                hint: 'email@example.com',
                                icon: Icons.mail_outline,
                                keyboardType: TextInputType.emailAddress,
                                validator: (value) {
                                  if (value == null || value.trim().isEmpty) {
                                    return 'Vui lòng nhập email';
                                  }
                                  if (!value.contains('@')) {
                                    return 'Email không hợp lệ';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 19),
                              _buildField(
                                controller: _phoneCtrl,
                                label: 'SỐ ĐIỆN THOẠI',
                                hint: '0912 345 678',
                                icon: Icons.phone_outlined,
                                keyboardType: TextInputType.phone,
                                validator: (value) =>
                                    value == null || value.trim().isEmpty
                                    ? 'Vui lòng nhập số điện thoại'
                                    : null,
                              ),
                              const SizedBox(height: 19),
                              _buildPasswordField(
                                controller: _passCtrl,
                                label: 'MẬT KHẨU',
                                hint: '••••••••',
                                showPass: _showPassword,
                                onToggle: () => setState(
                                  () => _showPassword = !_showPassword,
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Vui lòng nhập mật khẩu';
                                  }
                                  return value.length < 6
                                      ? 'Mật khẩu ít nhất 6 ký tự'
                                      : null;
                                },
                              ),
                              const SizedBox(height: 19),
                              _buildPasswordField(
                                controller: _confirmCtrl,
                                label: 'XÁC NHẬN MẬT KHẨU',
                                hint: '••••••••',
                                showPass: _showConfirm,
                                onToggle: () => setState(
                                  () => _showConfirm = !_showConfirm,
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Vui lòng xác nhận mật khẩu';
                                  }
                                  return value != _passCtrl.text
                                      ? 'Mật khẩu không khớp'
                                      : null;
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              _buildFooter(context, keyboardOpen),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFooter(BuildContext context, bool keyboardOpen) {
    final compact = MediaQuery.sizeOf(context).height < 700;
    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(
        compact ? 20 : 28,
        keyboardOpen ? 6 : 8,
        compact ? 20 : 28,
        keyboardOpen ? 4 : (compact ? 4 : 12),
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE8EDF2))),
      ),
      child: keyboardOpen
          ? _buildSignupButton(compact: true)
          : Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                InkWell(
                  onTap: () => setState(() => _agreeTerms = !_agreeTerms),
                  child: Row(
                    children: [
                      Checkbox(
                        value: _agreeTerms,
                        onChanged: (value) =>
                            setState(() => _agreeTerms = value ?? false),
                        activeColor: const Color(0xFF00A896),
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        visualDensity: VisualDensity.compact,
                      ),
                      Expanded(
                        child: Text.rich(
                          const TextSpan(
                            children: [
                              TextSpan(
                                text: 'Tôi đồng ý với ',
                                style: TextStyle(color: Color(0xFF52647B)),
                              ),
                              TextSpan(
                                text: 'Điều khoản dịch vụ',
                                style: TextStyle(color: Color(0xFF00A896)),
                              ),
                              TextSpan(
                                text: ' và ',
                                style: TextStyle(color: Color(0xFF52647B)),
                              ),
                              TextSpan(
                                text: 'Chính sách bảo mật',
                                style: TextStyle(color: Color(0xFF00A896)),
                              ),
                            ],
                          ),
                          style: GoogleFonts.inter(fontSize: compact ? 10 : 11),
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: compact ? 5 : 12),
                _buildSignupButton(compact: compact),
                Padding(
                  padding: EdgeInsets.symmetric(vertical: compact ? 7 : 13),
                  child: Row(
                    children: [
                      const Expanded(child: Divider(color: Color(0xFFD7DFE6))),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        child: Text(
                          'hoặc',
                          style: GoogleFonts.inter(
                            fontSize: compact ? 11 : 13,
                            color: const Color(0xFF8995A4),
                          ),
                        ),
                      ),
                      const Expanded(child: Divider(color: Color(0xFFD7DFE6))),
                    ],
                  ),
                ),
                _buildGoogleButton(compact: compact),
                SizedBox(height: compact ? 5 : 12),
                TextButton(
                  style: TextButton.styleFrom(
                    minimumSize: Size(0, compact ? 30 : 40),
                    padding: EdgeInsets.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  onPressed: () => Navigator.pop(context),
                  child: Text.rich(
                    TextSpan(
                      children: [
                        const TextSpan(
                          text: 'Đã có tài khoản? ',
                          style: TextStyle(color: Color(0xFF66758B)),
                        ),
                        TextSpan(
                          text: 'Đăng nhập',
                          style: GoogleFonts.inter(
                            color: const Color(0xFF00A896),
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                    style: GoogleFonts.inter(fontSize: compact ? 11 : 13),
                  ),
                ),
              ],
            ),
    );
  }

  // ── Top bar ───────────────────────────────────────────────
  Widget _buildTopBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFFF3F5F8),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFDCE3EB)),
              ),
              child: Icon(
                Icons.arrow_back_ios_new_rounded,
                color: const Color(0xFF09213B),
                size: 16,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Text(
            'AquaCare',
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF0A76B4),
            ),
          ),
        ],
      ),
    );
  }

  // ── Generic text field ────────────────────────────────────
  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 10,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF52647B),
            letterSpacing: 0.08,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          style: GoogleFonts.inter(
            fontSize: 13,
            color: const Color(0xFF09213B),
          ),
          validator: validator,
          decoration: _fieldDecoration(hint, icon),
        ),
      ],
    );
  }

  // ── Password field ────────────────────────────────────────
  Widget _buildPasswordField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required bool showPass,
    required VoidCallback onToggle,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 10,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF52647B),
            letterSpacing: 0.08,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          obscureText: !showPass,
          style: GoogleFonts.inter(
            fontSize: 13,
            color: const Color(0xFF09213B),
          ),
          validator: validator,
          decoration: _fieldDecoration(hint, Icons.lock_outline).copyWith(
            suffixIcon: GestureDetector(
              onTap: onToggle,
              child: Icon(
                showPass
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
                size: 18,
                color: const Color(0xFF728197),
              ),
            ),
          ),
        ),
      ],
    );
  }

  InputDecoration _fieldDecoration(String hint, IconData icon) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.inter(
        fontSize: 13,
        color: const Color(0xFF8895A8),
      ),
      prefixIcon: Icon(icon, size: 18, color: const Color(0xFF728197)),
      filled: true,
      fillColor: const Color(0xFFF3F5F8),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFDCE3EB), width: 1),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFDCE3EB), width: 1),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF00A896), width: 1),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFFF6B6B), width: 1),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFFF6B6B), width: 1),
      ),
      errorStyle: GoogleFonts.inter(
        fontSize: 11,
        color: const Color(0xFFFF6B6B),
      ),
    );
  }

  // ── Signup Button ─────────────────────────────────────────
  Widget _buildSignupButton({bool compact = false}) {
    return SizedBox(
      width: double.infinity,
      height: compact ? 44 : 50,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF16BFC8), Color(0xFF00A896)],
          ),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF00A896).withValues(alpha: 0.25),
              blurRadius: 20,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: _loading ? null : _handleSignup,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: _loading
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                )
              : Text(
                  'TẠO TÀI KHOẢN',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    letterSpacing: 0.08,
                  ),
                ),
        ),
      ),
    );
  }

  // ── Google Button ───────────────────────────────────────
  Widget _buildGoogleButton({bool compact = false}) {
    return SizedBox(
      width: double.infinity,
      height: compact ? 44 : 50,
      child: OutlinedButton(
        onPressed: _googleLoading ? null : _handleGoogleAuth,
        style: OutlinedButton.styleFrom(
          backgroundColor: Colors.white,
          side: const BorderSide(color: Color(0xFFC5D1DC), width: 1),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          overlayColor: Colors.white,
        ),
        child: _googleLoading
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    padding: const EdgeInsets.all(2),
                    decoration: const BoxDecoration(
                      color: Color(0xFF17283B),
                      shape: BoxShape.circle,
                    ),
                    child: CustomPaint(painter: GoogleLogoPainter()),
                  ),
                  const SizedBox(width: 12),
                  Flexible(
                    child: Text(
                      'Đăng ký bằng Google',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: const Color(0xFF09213B),
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
