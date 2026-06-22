import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dashboard_screen.dart';
import 'signup_screen.dart';
import 'admin_screen.dart';
import 'staff_screen.dart';

// ─── Tài khoản giả lập ───────────────────────────────────────
const _accounts = [
  {'email': 'phamlenhatminh1609@gmail.com', 'password': '16092005M', 'role': 'user'},
  {'email': 'admin1@gmail.com',             'password': '12345678',   'role': 'admin'},
  {'email': 'staff1@gmail.com',             'password': '12345678',   'role': 'staff'},
];

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
    await Future.delayed(const Duration(milliseconds: 800));

    if (!mounted) return;

    final email = _emailCtrl.text.trim();
    final password = _passCtrl.text;

    final matched = _accounts.firstWhere(
      (a) => a['email'] == email && a['password'] == password,
      orElse: () => {},
    );

    setState(() => _loading = false);

    if (matched.isNotEmpty) {
      final role = matched['role'];
      Widget destination;
      if (role == 'admin') {
        destination = const AdminScreen();
      } else if (role == 'staff') {
        destination = const StaffScreen();
      } else {
        destination = const DashboardScreen();
      }
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => destination,
          transitionsBuilder: (_, anim, __, child) =>
              FadeTransition(opacity: anim, child: child),
          transitionDuration: const Duration(milliseconds: 400),
        ),
      );
    } else {
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
              Text(
                'Email hoặc mật khẩu không đúng!',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: const Color(0xFFFF6B6B),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          duration: const Duration(seconds: 3),
        ),
      );
    }
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
                              color: Colors.white.withOpacity(0.4),
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
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    GestureDetector(
                                      onTap: () => setState(() => _rememberMe = !_rememberMe),
                                      behavior: HitTestBehavior.opaque,
                                      child: Row(
                                        children: [
                                          Transform.scale(
                                            scale: 0.85,
                                            child: Checkbox(
                                              value: _rememberMe,
                                              onChanged: (v) => setState(() => _rememberMe = v ?? false),
                                              activeColor: const Color(0xFF00A896),
                                              checkColor: Colors.white,
                                              side: const BorderSide(color: Colors.white24, width: 1.5),
                                              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                              visualDensity: VisualDensity.compact,
                                            ),
                                          ),
                                          Text(
                                            'Ghi nhớ đăng nhập',
                                            style: GoogleFonts.inter(
                                              fontSize: 12,
                                              color: Colors.white.withOpacity(0.4),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Text(
                                      'Quên mật khẩu?',
                                      style: GoogleFonts.inter(
                                        fontSize: 12,
                                        color: const Color(0xFF00A896),
                                        fontWeight: FontWeight.w500,
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
                                    color: Colors.white.withOpacity(0.06),
                                  ),
                                ),
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
                                Expanded(
                                  child: Container(
                                    height: 1,
                                    color: Colors.white.withOpacity(0.06),
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
                                  pageBuilder: (_, __, ___) => const SignupScreen(),
                                  transitionsBuilder: (_, anim, __, child) =>
                                      SlideTransition(
                                    position: Tween<Offset>(
                                      begin: const Offset(1.0, 0),
                                      end: Offset.zero,
                                    ).animate(CurvedAnimation(
                                        parent: anim, curve: Curves.easeOut)),
                                    child: child,
                                  ),
                                  transitionDuration:
                                      const Duration(milliseconds: 350),
                                ),
                              ),
                              child: RichText(
                                text: TextSpan(
                                  style: GoogleFonts.inter(fontSize: 13),
                                  children: [
                                    TextSpan(
                                      text: 'Chưa có tài khoản? ',
                                      style: TextStyle(
                                          color: Colors.white.withOpacity(0.35)),
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
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            gradient: const LinearGradient(
              colors: [Color(0xFF1B4F72), Color(0xFF00A896)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF00A896).withOpacity(0.3),
                blurRadius: 16,
                spreadRadius: 0,
              ),
            ],
          ),
          child: const Icon(Icons.water, color: Colors.white, size: 24),
        ),
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
                color: Colors.white.withOpacity(0.35),
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
            color: Colors.white.withOpacity(0.4),
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
            color: Colors.white.withOpacity(0.4),
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
                color: Colors.white.withOpacity(0.25),
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
      hintStyle:
          GoogleFonts.inter(fontSize: 13, color: Colors.white.withOpacity(0.2)),
      prefixIcon: Icon(icon, size: 18, color: Colors.white.withOpacity(0.2)),
      filled: true,
      fillColor: const Color.fromRGBO(255, 255, 255, 0.04),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
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
              color: const Color(0xFF00A896).withOpacity(0.25),
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
        onPressed: () {},
        style: OutlinedButton.styleFrom(
          backgroundColor: Colors.white.withOpacity(0.04),
          side: BorderSide(color: Colors.white.withOpacity(0.12), width: 1),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
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
              'Đăng nhập bằng Google',
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
      ..color = Colors.white.withOpacity(0.1)
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
