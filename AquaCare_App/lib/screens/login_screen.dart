import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dashboard_screen.dart';
import 'signup_screen.dart';
import 'admin_screen.dart';

import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_sign_in/google_sign_in.dart';

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// const String apiUrl = 'http://172.20.10.8:5000/api/auth';
const String apiUrl = 'https://aquacare-p78r.onrender.com/api/auth';
const String passwordRecoveryRedirect = 'aquacare://reset-password';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _showPassword = false;
  bool _loading = false;
  bool _rememberMe = false;
  bool _googleLoading = false;

  late AnimationController _fadeCtrl;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _fadeCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..forward();

    _fadeAnim = CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.06),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut));
  }

  @override
  void dispose() {
    _fadeCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);

    final identifier = _emailCtrl.text.trim();
    final password = _passCtrl.text;

    try {
      final res = await http.post(
        Uri.parse('$apiUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'identifier': identifier, 'password': password}),
      );

      setState(() => _loading = false);
      if (!mounted) return;

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('access_token', data['access_token']);

        final refreshToken = data['refresh_token'];
        if (refreshToken != null) {
          await prefs.setString('refresh_token', refreshToken);
          try {
            final authResponse = await Supabase.instance.client.auth.setSession(
              refreshToken,
            );
            debugPrint('🔑 Session sau set: ${authResponse.session?.user.id}');
            debugPrint(
              '✅ [SUCCESS]: Đã đồng bộ session Supabase thành công từ refresh_token.',
            );
          } catch (e) {
            debugPrint('❌ [ERROR]: Lỗi khi gọi setSession: $e');
          }
        }

        final userInfo = data['user_info'];
        final role = userInfo['role'];
        await prefs.setString('role', role);
        await prefs.setString('user_info', jsonEncode(userInfo));

        Widget destination;
        if (role == 'admin') {
          destination = const AdminScreen();
        } else if (role.toString().startsWith('staff')) {
          destination = const StaffScreen();
        } else {
          destination = const DashboardScreen();
        }
        debugPrint('🚀 Chuyển hướng sang màn hình: $destination');
        Navigator.pushReplacement(
          context,
          PageRouteBuilder(
            pageBuilder: (_, _, _) => destination,
            transitionsBuilder: (_, anim, _, child) =>
                FadeTransition(opacity: anim, child: child),
            transitionDuration: const Duration(milliseconds: 400),
          ),
        );
      } else {
        final data = jsonDecode(res.body);
        _showError(data['error'] ?? 'Đăng nhập thất bại');
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
        await Supabase.instance.client.from('users').insert({
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
      await prefs.setString('role', role);

      // Lưu user_info (dùng lại biến user đã lấy từ res.user phía trên)
      final userInfo = {
        'id': user.id,
        'email': user.email,
        'full_name':
            user.userMetadata?['full_name'] ?? user.userMetadata?['name'] ?? '',
        'avatar_url':
            user.userMetadata?['avatar_url'] ?? user.userMetadata?['picture'],
        'role': role,
      };
      await prefs.setString('user_info', jsonEncode(userInfo));

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
      _showError('Lỗi đăng nhập Google: $e');
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
                  fontSize: 13,
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
              child: LayoutBuilder(
                builder: (context, constraints) => SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(28, 0, 28, 28),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                      minHeight: constraints.maxHeight,
                    ),
                    child: IntrinsicHeight(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 40),
                          // ── Logo & Brand ──
                          _buildBrandHeader(),
                          const SizedBox(height: 48),

                          // ── Tiêu đề form ──
                          Text(
                            'Đăng nhập',
                            style: GoogleFonts.inter(
                              fontSize: 28,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Nhập thông tin tài khoản của bạn',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color: Colors.white.withValues(alpha: 0.4),
                            ),
                          ),
                          const SizedBox(height: 36),

                          // ── Form ──
                          Form(
                            key: _formKey,
                            child: Column(
                              children: [
                                _buildEmailField(),
                                const SizedBox(height: 16),
                                _buildPasswordField(),
                                const SizedBox(height: 16),

                                // ── Ghi nhớ & Quên mật khẩu ──
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    GestureDetector(
                                      onTap: () => setState(
                                        () => _rememberMe = !_rememberMe,
                                      ),
                                      behavior: HitTestBehavior.opaque,
                                      child: Row(
                                        children: [
                                          Transform.scale(
                                            scale: 0.85,
                                            child: Checkbox(
                                              value: _rememberMe,
                                              onChanged: (v) => setState(
                                                () => _rememberMe = v ?? false,
                                              ),
                                              activeColor: const Color(
                                                0xFF00A896,
                                              ),
                                              checkColor: Colors.white,
                                              side: const BorderSide(
                                                color: Colors.white24,
                                                width: 1.5,
                                              ),
                                              materialTapTargetSize:
                                                  MaterialTapTargetSize
                                                      .shrinkWrap,
                                              visualDensity:
                                                  VisualDensity.compact,
                                            ),
                                          ),
                                          Text(
                                            'Ghi nhớ đăng nhập',
                                            style: GoogleFonts.inter(
                                              fontSize: 12,
                                              color: Colors.white.withValues(
                                                alpha: 0.4,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    GestureDetector(
                                      behavior: HitTestBehavior.opaque,
                                      onTap: () => Navigator.of(context).push(
                                        MaterialPageRoute(
                                          builder: (_) =>
                                              const ForgotPasswordScreen(),
                                        ),
                                      ),
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(
                                          vertical: 8,
                                        ),
                                        child: Text(
                                          'Quên mật khẩu?',
                                          style: GoogleFonts.inter(
                                            fontSize: 12,
                                            color: const Color(0xFF00A896),
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),

                                const SizedBox(height: 20),
                                _buildLoginButton(),
                              ],
                            ),
                          ),

                          // ── Divider ──
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 24),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Container(
                                    height: 1,
                                    color: Colors.white.withValues(alpha: 0.06),
                                  ),
                                ),
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 14,
                                  ),
                                  child: Text(
                                    'hoặc',
                                    style: GoogleFonts.inter(
                                      fontSize: 11,
                                      color: Colors.white.withValues(
                                        alpha: 0.25,
                                      ),
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: Container(
                                    height: 1,
                                    color: Colors.white.withValues(alpha: 0.06),
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // ── Google Login Button ──
                          _buildGoogleButton(),

                          const SizedBox(height: 28),

                          // ── Đăng ký ──
                          Center(
                            child: GestureDetector(
                              onTap: () => Navigator.push(
                                context,
                                PageRouteBuilder(
                                  pageBuilder: (_, _, _) =>
                                      const SignupScreen(),
                                  transitionsBuilder: (_, anim, _, child) =>
                                      SlideTransition(
                                        position:
                                            Tween<Offset>(
                                              begin: const Offset(1.0, 0),
                                              end: Offset.zero,
                                            ).animate(
                                              CurvedAnimation(
                                                parent: anim,
                                                curve: Curves.easeOut,
                                              ),
                                            ),
                                        child: child,
                                      ),
                                  transitionDuration: const Duration(
                                    milliseconds: 350,
                                  ),
                                ),
                              ),
                              child: RichText(
                                text: TextSpan(
                                  style: GoogleFonts.inter(fontSize: 13),
                                  children: [
                                    TextSpan(
                                      text: 'Chưa có tài khoản? ',
                                      style: TextStyle(
                                        color: Colors.white.withValues(
                                          alpha: 0.35,
                                        ),
                                      ),
                                    ),
                                    const TextSpan(
                                      text: 'Đăng ký ngay',
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
                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ── Brand Header ──────────────────────────────────────────
  Widget _buildBrandHeader() {
    return Row(
      children: [
        Image.asset('assets/images/logo.png', height: 48, fit: BoxFit.contain),
        const SizedBox(width: 14),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'AQUACARE',
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: Colors.white,
                letterSpacing: 0.08,
              ),
            ),
            Text(
              'Smart IoT Farming',
              style: GoogleFonts.inter(
                fontSize: 11,
                color: Colors.white.withValues(alpha: 0.35),
                letterSpacing: 0.06,
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ── Email Field ───────────────────────────────────────────
  Widget _buildEmailField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'EMAIL',
          style: GoogleFonts.inter(
            fontSize: 10,
            fontWeight: FontWeight.w600,
            color: Colors.white.withValues(alpha: 0.4),
            letterSpacing: 0.08,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _emailCtrl,
          keyboardType: TextInputType.emailAddress,
          style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
          decoration: _fieldDecoration('email@example.com', Icons.mail_outline),
          validator: (v) {
            if (v == null || v.trim().isEmpty) return 'Vui lòng nhập email';
            if (!v.contains('@')) return 'Email không hợp lệ';
            return null;
          },
        ),
      ],
    );
  }

  // ── Password Field ────────────────────────────────────────
  Widget _buildPasswordField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'MẬT KHẨU',
          style: GoogleFonts.inter(
            fontSize: 10,
            fontWeight: FontWeight.w600,
            color: Colors.white.withValues(alpha: 0.4),
            letterSpacing: 0.08,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _passCtrl,
          obscureText: !_showPassword,
          style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
          decoration: _fieldDecoration('••••••••', Icons.lock_outline).copyWith(
            suffixIcon: GestureDetector(
              onTap: () => setState(() => _showPassword = !_showPassword),
              child: Icon(
                _showPassword
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
                size: 18,
                color: Colors.white.withValues(alpha: 0.25),
              ),
            ),
          ),
          validator: (v) {
            if (v == null || v.isEmpty) return 'Vui lòng nhập mật khẩu';
            return null;
          },
        ),
      ],
    );
  }

  InputDecoration _fieldDecoration(String hint, IconData icon) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.inter(
        fontSize: 13,
        color: Colors.white.withValues(alpha: 0.2),
      ),
      prefixIcon: Icon(
        icon,
        size: 18,
        color: Colors.white.withValues(alpha: 0.2),
      ),
      filled: true,
      fillColor: const Color.fromRGBO(255, 255, 255, 0.04),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(
          color: Color.fromRGBO(255, 255, 255, 0.08),
          width: 1,
        ),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(
          color: Color.fromRGBO(255, 255, 255, 0.08),
          width: 1,
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(
          color: Color.fromRGBO(0, 229, 160, 0.3),
          width: 1,
        ),
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

  // ── Login Button ──────────────────────────────────────────
  Widget _buildLoginButton() {
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
              color: const Color(0xFF00A896).withValues(alpha: 0.25),
              blurRadius: 20,
              spreadRadius: 0,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: _loading ? null : _handleLogin,
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
                  'ĐĂNG NHẬP',
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

  // ── Google Button ─────────────────────────────────────────
  Widget _buildGoogleButton() {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: OutlinedButton(
        onPressed: _googleLoading ? null : _handleGoogleAuth,
        style: OutlinedButton.styleFrom(
          backgroundColor: Colors.white.withValues(alpha: 0.04),
          side: BorderSide(
            color: Colors.white.withValues(alpha: 0.12),
            width: 1,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
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
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CustomPaint(painter: GoogleLogoPainter()),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Đăng nhập bằng Google',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: Colors.white.withValues(alpha: 0.75),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _loading = false;
  bool _sent = false;
  String _error = '';

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _sendResetEmail() async {
    if (_loading || !_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = '';
    });

    try {
      await Supabase.instance.client.auth.resetPasswordForEmail(
        _emailController.text.trim().toLowerCase(),
        redirectTo: passwordRecoveryRedirect,
      );
      if (!mounted) return;
      setState(() => _sent = true);
    } on AuthException catch (error) {
      if (mounted) setState(() => _error = error.message);
    } catch (_) {
      if (mounted) {
        setState(
          () => _error =
              'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.',
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return _RecoveryPageFrame(
      onBack: () => Navigator.of(context).pop(),
      child: _sent ? _buildSentState() : _buildRequestForm(),
    );
  }

  Widget _buildRequestForm() {
    return Form(
      key: _formKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _RecoveryHeader(
            title: 'Quên mật khẩu?',
            description:
                'Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu cho bạn.',
          ),
          const SizedBox(height: 24),
          Text(
            'EMAIL',
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: Colors.white.withValues(alpha: 0.48),
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.done,
            autofillHints: const [AutofillHints.email],
            onFieldSubmitted: (_) => _sendResetEmail(),
            style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
            decoration: _recoveryInputDecoration('email@example.com'),
            validator: (value) {
              final email = value?.trim() ?? '';
              if (email.isEmpty) return 'Vui lòng nhập email';
              if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(email)) {
                return 'Email không hợp lệ';
              }
              return null;
            },
          ),
          if (_error.isNotEmpty) ...[
            const SizedBox(height: 14),
            _RecoveryError(message: _error),
          ],
          const SizedBox(height: 20),
          _RecoveryButton(
            label: 'GỬI LINK ĐẶT LẠI',
            loading: _loading,
            onPressed: _sendResetEmail,
          ),
        ],
      ),
    );
  }

  Widget _buildSentState() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const _RecoveryHeader(
          title: 'Email đã được gửi!',
          description:
              'Nếu email thuộc một tài khoản AquaCare, bạn sẽ nhận được liên kết đặt lại mật khẩu.',
        ),
        const SizedBox(height: 12),
        Text(
          _emailController.text.trim().toLowerCase(),
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(
            color: const Color(0xFF00A896),
            fontWeight: FontWeight.w700,
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 24),
        OutlinedButton(
          onPressed: _loading
              ? null
              : () => setState(() {
                  _sent = false;
                  _error = '';
                }),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size.fromHeight(48),
            foregroundColor: Colors.white.withValues(alpha: 0.75),
            side: BorderSide(color: Colors.white.withValues(alpha: 0.12)),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: Text('Gửi lại email', style: GoogleFonts.inter(fontSize: 13)),
        ),
      ],
    );
  }
}

class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _obscurePassword = true;
  bool _loading = false;
  bool _completed = false;
  String _error = '';

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  Future<void> _updatePassword() async {
    if (_loading || !_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = '';
    });

    try {
      await Supabase.instance.client.auth.updateUser(
        UserAttributes(password: _passwordController.text),
      );
      try {
        await Supabase.instance.client.auth.signOut();
      } catch (error) {
        debugPrint('Không thể đóng recovery session: $error');
      }
      final prefs = await SharedPreferences.getInstance();
      for (final key in [
        'cs_auth',
        'access_token',
        'refresh_token',
        'role',
        'user_info',
      ]) {
        await prefs.remove(key);
      }
      if (!mounted) return;
      setState(() => _completed = true);
    } on AuthException catch (error) {
      if (mounted) setState(() => _error = error.message);
    } catch (_) {
      if (mounted) {
        setState(
          () => _error =
              'Không thể cập nhật mật khẩu. Liên kết có thể đã hết hạn.',
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _returnToLogin() {
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (_) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: _RecoveryPageFrame(
        onBack: _returnToLogin,
        child: _completed ? _buildCompletedState() : _buildResetForm(),
      ),
    );
  }

  Widget _buildResetForm() {
    return Form(
      key: _formKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _RecoveryHeader(
            title: 'Đặt mật khẩu mới',
            description: 'Tạo mật khẩu mới cho tài khoản AquaCare của bạn.',
          ),
          const SizedBox(height: 24),
          _RecoveryPasswordField(
            label: 'MẬT KHẨU MỚI',
            controller: _passwordController,
            obscure: _obscurePassword,
            textInputAction: TextInputAction.next,
            onToggle: () =>
                setState(() => _obscurePassword = !_obscurePassword),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Vui lòng nhập mật khẩu mới';
              }
              if (value.length < 6) return 'Mật khẩu ít nhất 6 ký tự';
              return null;
            },
          ),
          const SizedBox(height: 16),
          _RecoveryPasswordField(
            label: 'XÁC NHẬN MẬT KHẨU',
            controller: _confirmController,
            obscure: _obscurePassword,
            textInputAction: TextInputAction.done,
            onToggle: () =>
                setState(() => _obscurePassword = !_obscurePassword),
            onSubmitted: (_) => _updatePassword(),
            validator: (value) => value != _passwordController.text
                ? 'Mật khẩu xác nhận không khớp'
                : null,
          ),
          if (_error.isNotEmpty) ...[
            const SizedBox(height: 14),
            _RecoveryError(message: _error),
          ],
          const SizedBox(height: 20),
          _RecoveryButton(
            label: 'CẬP NHẬT MẬT KHẨU',
            loading: _loading,
            onPressed: _updatePassword,
          ),
        ],
      ),
    );
  }

  Widget _buildCompletedState() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const _RecoveryHeader(
          title: 'Đã cập nhật mật khẩu',
          description: 'Bạn có thể đăng nhập bằng mật khẩu mới.',
        ),
        const SizedBox(height: 24),
        _RecoveryButton(
          label: 'ĐĂNG NHẬP',
          loading: false,
          onPressed: _returnToLogin,
        ),
      ],
    );
  }
}

class _RecoveryPageFrame extends StatelessWidget {
  final Widget child;
  final VoidCallback onBack;

  const _RecoveryPageFrame({required this.child, required this.onBack});

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
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(24, 28, 24, 32),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Align(
                      alignment: Alignment.centerLeft,
                      child: TextButton(
                        onPressed: onBack,
                        style: TextButton.styleFrom(
                          foregroundColor: Colors.white.withValues(alpha: 0.62),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 4,
                            vertical: 10,
                          ),
                        ),
                        child: Text(
                          'Quay lại đăng nhập',
                          style: GoogleFonts.inter(fontSize: 12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.all(28),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.035),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.08),
                        ),
                      ),
                      child: child,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _RecoveryHeader extends StatelessWidget {
  final String title;
  final String description;

  const _RecoveryHeader({required this.title, required this.description});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 56,
          height: 56,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1B4F72), Color(0xFF00A896)],
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Text(
            'A',
            style: GoogleFonts.inter(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(height: 22),
        Text(
          title,
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          description,
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(
            fontSize: 13,
            height: 1.55,
            color: Colors.white.withValues(alpha: 0.52),
          ),
        ),
      ],
    );
  }
}

class _RecoveryPasswordField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final bool obscure;
  final VoidCallback onToggle;
  final TextInputAction textInputAction;
  final FormFieldValidator<String>? validator;
  final ValueChanged<String>? onSubmitted;

  const _RecoveryPasswordField({
    required this.label,
    required this.controller,
    required this.obscure,
    required this.onToggle,
    required this.textInputAction,
    this.validator,
    this.onSubmitted,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 10,
            fontWeight: FontWeight.w600,
            color: Colors.white.withValues(alpha: 0.48),
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          obscureText: obscure,
          textInputAction: textInputAction,
          autofillHints: const [AutofillHints.newPassword],
          onFieldSubmitted: onSubmitted,
          validator: validator,
          style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
          decoration: _recoveryInputDecoration('••••••••').copyWith(
            suffixIcon: TextButton(
              onPressed: onToggle,
              child: Text(
                obscure ? 'Hiện' : 'Ẩn',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: const Color(0xFF00A896),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _RecoveryButton extends StatelessWidget {
  final String label;
  final bool loading;
  final VoidCallback onPressed;

  const _RecoveryButton({
    required this.label,
    required this.loading,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 50,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1B4F72), Color(0xFF00A896)],
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: ElevatedButton(
          onPressed: loading ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: loading
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : Text(
                  label,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
        ),
      ),
    );
  }
}

class _RecoveryError extends StatelessWidget {
  final String message;

  const _RecoveryError({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFF6B6B).withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: const Color(0xFFFF6B6B).withValues(alpha: 0.28),
        ),
      ),
      child: Text(
        message,
        style: GoogleFonts.inter(
          fontSize: 12,
          height: 1.4,
          color: const Color(0xFFFFB4B4),
        ),
      ),
    );
  }
}

InputDecoration _recoveryInputDecoration(String hint) {
  return InputDecoration(
    hintText: hint,
    hintStyle: GoogleFonts.inter(
      fontSize: 13,
      color: Colors.white.withValues(alpha: 0.26),
    ),
    filled: true,
    fillColor: Colors.white.withValues(alpha: 0.04),
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: Color(0xFF00A896)),
    ),
    errorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: Color(0xFFFF6B6B)),
    ),
    focusedErrorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: Color(0xFFFF6B6B)),
    ),
    errorStyle: GoogleFonts.inter(fontSize: 11, color: const Color(0xFFFF6B6B)),
  );
}

// ════════════════════════════════════════════════════════════
//              Google G Logo Painter (shared)
// ════════════════════════════════════════════════════════════
class GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double cx = size.width / 2;
    final double cy = size.height / 2;
    final double r = size.width / 2;

    final bgPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.1)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(cx, cy), r, bgPaint);

    final segments = [
      {'color': const Color(0xFF4285F4), 'start': -1.8, 'sweep': 1.6},
      {'color': const Color(0xFFEA4335), 'start': -0.2, 'sweep': 1.6},
      {'color': const Color(0xFFFBBC05), 'start': 1.4, 'sweep': 0.9},
      {'color': const Color(0xFF34A853), 'start': 2.3, 'sweep': 1.5},
    ];

    for (final seg in segments) {
      final paint = Paint()
        ..color = seg['color'] as Color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.0
        ..strokeCap = StrokeCap.round;
      canvas.drawArc(
        Rect.fromCircle(center: Offset(cx, cy), radius: r * 0.68),
        seg['start'] as double,
        seg['sweep'] as double,
        false,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(GoogleLogoPainter old) => false;
}
