import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'login_screen.dart';

class AdminScreen extends StatelessWidget {
  const AdminScreen({super.key});

  void _handleLogout(BuildContext context) {
    Navigator.pushAndRemoveUntil(
      context,
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const LoginScreen(),
        transitionsBuilder: (_, anim, __, child) =>
            FadeTransition(opacity: anim, child: child),
        transitionDuration: const Duration(milliseconds: 350),
      ),
      (route) => false,
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
            transform: GradientRotation(135 * pi / 180),
            colors: [Color(0xFF0A0612), Color(0xFF130A24), Color(0xFF1A0A2E)],
            stops: [0.0, 0.45, 1.0],
          ),
        ),
        child: Stack(
          children: [
            // ── Decorative blobs ──
            Positioned(
              top: -120,
              left: -120,
              child: _GlowBlob(
                size: 400,
                color: const Color(0xFF8B5CF6),
                opacity: 0.10,
              ),
            ),
            Positioned(
              bottom: -100,
              right: -100,
              child: _GlowBlob(
                size: 340,
                color: const Color(0xFF6D28D9),
                opacity: 0.12,
              ),
            ),
            // ── Grid pattern ──
            Positioned.fill(
              child: CustomPaint(painter: _DotGridPainter(
                color: const Color(0xFF8B5CF6).withOpacity(0.04),
              )),
            ),

            // ── Logout button top-right ──
            SafeArea(
              child: Align(
                alignment: Alignment.topRight,
                child: Padding(
                  padding: const EdgeInsets.only(top: 12, right: 20),
                  child: _LogoutButton(onTap: () => _handleLogout(context)),
                ),
              ),
            ),

            // ── Center content ──
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Icon
                  Container(
                    width: 88,
                    height: 88,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF4C1D95), Color(0xFF8B5CF6)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(26),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF8B5CF6).withOpacity(0.4),
                          blurRadius: 40,
                          spreadRadius: 0,
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.admin_panel_settings_rounded,
                      color: Colors.white,
                      size: 42,
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Badge
                  _ComingSoonBadge(
                    color: const Color(0xFF8B5CF6),
                    label: 'ADMIN PANEL',
                  ),
                  const SizedBox(height: 20),

                  // Title
                  Text(
                    'Trang Quản Trị',
                    style: GoogleFonts.inter(
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Subtitle
                  Text(
                    'Tính năng đang được phát triển',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: Colors.white.withOpacity(0.5),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Coming soon badge
                  _FeatureBadge(color: const Color(0xFF8B5CF6), label: 'COMING SOON'),
                  const SizedBox(height: 52),

                  // Feature cards row
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 36),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _FeatureCard(icon: Icons.people_outline_rounded,   label: 'Quản lý\nUsers',   color: const Color(0xFF8B5CF6)),
                        const SizedBox(width: 14),
                        _FeatureCard(icon: Icons.settings_outlined,        label: 'Hệ thống',          color: const Color(0xFF8B5CF6)),
                        const SizedBox(width: 14),
                        _FeatureCard(icon: Icons.bar_chart_rounded,        label: 'Thống kê',           color: const Color(0xFF8B5CF6)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════
//                     STAFF SCREEN
// ════════════════════════════════════════════════════════════
class StaffScreen extends StatelessWidget {
  const StaffScreen({super.key});

  void _handleLogout(BuildContext context) {
    Navigator.pushAndRemoveUntil(
      context,
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const LoginScreen(),
        transitionsBuilder: (_, anim, __, child) =>
            FadeTransition(opacity: anim, child: child),
        transitionDuration: const Duration(milliseconds: 350),
      ),
      (route) => false,
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
            transform: GradientRotation(135 * pi / 180),
            colors: [Color(0xFF020F0D), Color(0xFF041A16), Color(0xFF062420)],
            stops: [0.0, 0.45, 1.0],
          ),
        ),
        child: Stack(
          children: [
            // ── Decorative blobs ──
            Positioned(
              top: -100,
              right: -120,
              child: _GlowBlob(
                size: 380,
                color: const Color(0xFF00E5A0),
                opacity: 0.08,
              ),
            ),
            Positioned(
              bottom: -80,
              left: -80,
              child: _GlowBlob(
                size: 320,
                color: const Color(0xFF00A896),
                opacity: 0.10,
              ),
            ),
            // ── Dot grid ──
            Positioned.fill(
              child: CustomPaint(painter: _DotGridPainter(
                color: const Color(0xFF00E5A0).withOpacity(0.04),
              )),
            ),

            // ── Logout button top-right ──
            SafeArea(
              child: Align(
                alignment: Alignment.topRight,
                child: Padding(
                  padding: const EdgeInsets.only(top: 12, right: 20),
                  child: _LogoutButton(
                    onTap: () => _handleLogout(context),
                    color: const Color(0xFF00E5A0),
                  ),
                ),
              ),
            ),

            // ── Center content ──
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Icon
                  Container(
                    width: 88,
                    height: 88,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF065F46), Color(0xFF00A896)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(26),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF00A896).withOpacity(0.35),
                          blurRadius: 40,
                          spreadRadius: 0,
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.badge_outlined,
                      color: Colors.white,
                      size: 42,
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Badge
                  _ComingSoonBadge(
                    color: const Color(0xFF00E5A0),
                    label: 'STAFF PORTAL',
                  ),
                  const SizedBox(height: 20),

                  // Title
                  Text(
                    'Trang Nhân Viên',
                    style: GoogleFonts.inter(
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Subtitle
                  Text(
                    'Tính năng đang được phát triển',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: Colors.white.withOpacity(0.5),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Coming soon badge
                  _FeatureBadge(color: const Color(0xFF00E5A0), label: 'COMING SOON'),
                  const SizedBox(height: 52),

                  // Feature cards row
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 36),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _FeatureCard(icon: Icons.set_meal_outlined,        label: 'Ao nuôi',            color: const Color(0xFF00A896)),
                        const SizedBox(width: 14),
                        _FeatureCard(icon: Icons.assignment_outlined,      label: 'Báo cáo',            color: const Color(0xFF00A896)),
                        const SizedBox(width: 14),
                        _FeatureCard(icon: Icons.calendar_month_outlined,  label: 'Lịch trực',          color: const Color(0xFF00A896)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════
//                   SHARED WIDGETS
// ════════════════════════════════════════════════════════════

class _GlowBlob extends StatelessWidget {
  final double size;
  final Color color;
  final double opacity;
  const _GlowBlob({required this.size, required this.color, required this.opacity});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [color.withOpacity(opacity), Colors.transparent],
          stops: const [0.0, 1.0],
        ),
      ),
    );
  }
}

class _DotGridPainter extends CustomPainter {
  final Color color;
  const _DotGridPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color;
    const spacing = 40.0;
    const radius = 1.2;
    for (double x = 0; x < size.width; x += spacing) {
      for (double y = 0; y < size.height; y += spacing) {
        canvas.drawCircle(Offset(x, y), radius, paint);
      }
    }
  }

  @override
  bool shouldRepaint(_DotGridPainter old) => old.color != color;
}

class _LogoutButton extends StatelessWidget {
  final VoidCallback onTap;
  final Color color;
  const _LogoutButton({
    required this.onTap,
    this.color = const Color(0xFF8B5CF6),
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withOpacity(0.25), width: 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.logout_rounded, size: 15, color: color.withOpacity(0.8)),
            const SizedBox(width: 6),
            Text(
              'Đăng xuất',
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: color.withOpacity(0.8),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ComingSoonBadge extends StatelessWidget {
  final Color color;
  final String label;
  const _ComingSoonBadge({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: color.withOpacity(0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: color.withOpacity(0.5), blurRadius: 6)],
            ),
          ),
          const SizedBox(width: 7),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: color,
              letterSpacing: 0.1,
            ),
          ),
        ],
      ),
    );
  }
}

class _FeatureBadge extends StatelessWidget {
  final Color color;
  final String label;
  const _FeatureBadge({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: GoogleFonts.inter(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          color: color,
          letterSpacing: 0.1,
        ),
      ),
    );
  }
}

class _FeatureCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _FeatureCard({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 90,
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.12), width: 1),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 26),
          const SizedBox(height: 8),
          Text(
            label,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w500,
              color: Colors.white.withOpacity(0.45),
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}
