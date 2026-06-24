import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'login_screen.dart' show GoogleLogoPainter;
import 'dart:convert';
import 'package:http/http.dart' as http;

const String apiUrl = 'http://10.0.2.2:5000/api/auth';

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

  late AnimationController _fadeCtrl;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _fadeCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..forward();
    _fadeAnim = CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(
      begin: const Offset(0.04, 0),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut));
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
      _showError('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật!');
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
            const Icon(Icons.warning_rounded, color: Color(0xFFFF6B6B), size: 18),
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
            const Icon(Icons.check_circle_outline, color: Color(0xFF00A896), size: 18),
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
    return Scaffold(
      backgroundColor: const Color(0xFF060E1A),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF060E1A), Color(0xFF0A1628), Color(0xFF0D1D33)],
            stops: [0.0, 0.5, 1.0],
          ),
        ),
        child: SafeArea(
          child: FadeTransition(
            opacity: _fadeAnim,
            child: SlideTransition(
              position: _slideAnim,
              child: Column(
                children: [
                  // ── Top bar với nút back ──
                  _buildTopBar(context),

                  // ── Nội dung scroll ──
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(28, 8, 28, 40),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Tạo tài khoản',
                            style: GoogleFonts.inter(
                              fontSize: 28,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Điền thông tin để bắt đầu sử dụng AquaCare',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color: Colors.white.withOpacity(0.4),
                            ),
                          ),
                          const SizedBox(height: 32),

                          Form(
                            key: _formKey,
                            child: Column(
                              children: [
                                _buildField(
                                  controller: _nameCtrl,
                                  label: 'HỌ VÀ TÊN',
                                  hint: 'Nguyễn Văn A',
                                  icon: Icons.person_outline,
                                  validator: (v) =>
                                      (v == null || v.trim().isEmpty)
                                          ? 'Vui lòng nhập họ tên'
                                          : null,
                                ),
                                const SizedBox(height: 16),
                                _buildField(
                                  controller: _emailCtrl,
                                  label: 'EMAIL',
                                  hint: 'email@example.com',
                                  icon: Icons.mail_outline,
                                  keyboardType: TextInputType.emailAddress,
                                  validator: (v) {
                                    if (v == null || v.trim().isEmpty)
                                      return 'Vui lòng nhập email';
                                    if (!v.contains('@'))
                                      return 'Email không hợp lệ';
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 16),
                                _buildField(
                                  controller: _phoneCtrl,
                                  label: 'SỐ ĐIỆN THOẠI',
                                  hint: '0912 345 678',
                                  icon: Icons.phone_outlined,
                                  keyboardType: TextInputType.phone,
                                  validator: (v) =>
                                      (v == null || v.trim().isEmpty)
                                          ? 'Vui lòng nhập số điện thoại'
                                          : null,
                                ),
                                const SizedBox(height: 16),
                                _buildPasswordField(
                                  controller: _passCtrl,
                                  label: 'MẬT KHẨU',
                                  hint: '••••••••',
                                  showPass: _showPassword,
                                  onToggle: () => setState(
                                      () => _showPassword = !_showPassword),
                                  validator: (v) {
                                    if (v == null || v.isEmpty)
                                      return 'Vui lòng nhập mật khẩu';
                                    if (v.length < 6)
                                      return 'Mật khẩu ít nhất 6 ký tự';
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 16),
                                _buildPasswordField(
                                  controller: _confirmCtrl,
                                  label: 'XÁC NHẬN MẬT KHẨU',
                                  hint: '••••••••',
                                  showPass: _showConfirm,
                                  onToggle: () => setState(
                                      () => _showConfirm = !_showConfirm),
                                  validator: (v) {
                                    if (v == null || v.isEmpty)
                                      return 'Vui lòng xác nhận mật khẩu';
                                    if (v != _passCtrl.text)
                                      return 'Mật khẩu không khớp';
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 24),

                                // ── Điều khoản & Chính sách ──
                                GestureDetector(
                                  onTap: () => setState(() => _agreeTerms = !_agreeTerms),
                                  behavior: HitTestBehavior.opaque,
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Transform.scale(
                                        scale: 0.85,
                                        child: Checkbox(
                                          value: _agreeTerms,
                                          onChanged: (v) => setState(() => _agreeTerms = v ?? false),
                                          activeColor: const Color(0xFF00A896),
                                          checkColor: Colors.white,
                                          side: const BorderSide(color: Colors.white24, width: 1.5),
                                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                          visualDensity: VisualDensity.compact,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      Expanded(
                                        child: Padding(
                                          padding: const EdgeInsets.only(top: 11),
                                          child: RichText(
                                            text: TextSpan(
                                              style: GoogleFonts.inter(
                                                fontSize: 11,
                                                color: Colors.white.withOpacity(0.35),
                                                height: 1.5,
                                              ),
                                              children: const [
                                                TextSpan(text: 'Tôi đồng ý với '),
                                                TextSpan(
                                                  text: 'Điều khoản dịch vụ',
                                                  style: TextStyle(
                                                    color: Color(0xFF00A896),
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                ),
                                                TextSpan(text: ' và '),
                                                TextSpan(
                                                  text: 'Chính sách bảo mật',
                                                  style: TextStyle(
                                                    color: Color(0xFF00A896),
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),

                                const SizedBox(height: 20),
                                _buildSignupButton(),

                                // ── Divider ──
                                Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 24),
                                  child: Row(
                                    children: [
                                      Expanded(child: Container(height: 1, color: Colors.white.withOpacity(0.06))),
                                      Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 14),
                                        child: Text(
                                          'hoặc',
                                          style: GoogleFonts.inter(
                                            fontSize: 11,
                                            color: Colors.white.withOpacity(0.25),
                                            letterSpacing: 0.5,
                                          ),
                                        ),
                                      ),
                                      Expanded(child: Container(height: 1, color: Colors.white.withOpacity(0.06))),
                                    ],
                                  ),
                                ),

                                // ── Google Signup Button ──
                                _buildGoogleButton(),
                              ],
                            ),
                          ),

                          const SizedBox(height: 28),
                          Center(
                            child: GestureDetector(
                              onTap: () => Navigator.pop(context),
                              child: RichText(
                                text: TextSpan(
                                  style: GoogleFonts.inter(fontSize: 13),
                                  children: [
                                    TextSpan(
                                      text: 'Đã có tài khoản? ',
                                      style: TextStyle(
                                          color:
                                              Colors.white.withOpacity(0.35)),
                                    ),
                                    const TextSpan(
                                      text: 'Đăng nhập',
                                      style: TextStyle(
                                        color: Color(0xFF00A896),
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
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
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: Icon(
                Icons.arrow_back_ios_new_rounded,
                color: Colors.white.withOpacity(0.7),
                size: 16,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Text(
            'Đăng ký',
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.white,
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
            color: Colors.white.withOpacity(0.4),
            letterSpacing: 0.08,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
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
            color: Colors.white.withOpacity(0.4),
            letterSpacing: 0.08,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          obscureText: !showPass,
          style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
          validator: validator,
          decoration: _fieldDecoration(hint, Icons.lock_outline).copyWith(
            suffixIcon: GestureDetector(
              onTap: onToggle,
              child: Icon(
                showPass
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
                size: 18,
                color: Colors.white.withOpacity(0.25),
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
      hintStyle:
          GoogleFonts.inter(fontSize: 13, color: Colors.white.withOpacity(0.2)),
      prefixIcon:
          Icon(icon, size: 18, color: Colors.white.withOpacity(0.2)),
      filled: true,
      fillColor: const Color.fromRGBO(255, 255, 255, 0.04),
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(
            color: Color.fromRGBO(255, 255, 255, 0.08), width: 1),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(
            color: Color.fromRGBO(255, 255, 255, 0.08), width: 1),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(
            color: Color.fromRGBO(0, 229, 160, 0.3), width: 1),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFFF6B6B), width: 1),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFFF6B6B), width: 1),
      ),
      errorStyle:
          GoogleFonts.inter(fontSize: 11, color: const Color(0xFFFF6B6B)),
    );
  }

  // ── Signup Button ─────────────────────────────────────────
  Widget _buildSignupButton() {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1B4F72), Color(0xFF00A896)],
          ),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF00A896).withOpacity(0.25),
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
  Widget _buildGoogleButton() {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: OutlinedButton(
        onPressed: () {},
        style: OutlinedButton.styleFrom(
          backgroundColor: Colors.white.withOpacity(0.04),
          side: BorderSide(
            color: Colors.white.withOpacity(0.12),
            width: 1,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          overlayColor: Colors.white,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 20,
              height: 20,
              child: CustomPaint(painter: GoogleLogoPainter()),
            ),
            const SizedBox(width: 12),
            Text(
              'Đăng ký bằng Google',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: Colors.white.withOpacity(0.75),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
