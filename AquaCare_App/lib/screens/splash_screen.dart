import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// A short brand transition before the app's existing initial destination.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key, required this.destination});

  final Widget destination;

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 2500),
  );

  @override
  void initState() {
    super.initState();
    _controller.addStatusListener(_onAnimationStatus);
    _controller.forward();
  }

  void _onAnimationStatus(AnimationStatus status) {
    if (status != AnimationStatus.completed || !mounted) return;
    Navigator.of(context).pushReplacement(
      PageRouteBuilder<void>(
        pageBuilder: (context, animation, secondaryAnimation) =>
            widget.destination,
        transitionDuration: const Duration(milliseconds: 350),
        transitionsBuilder: (context, animation, secondaryAnimation, child) =>
            FadeTransition(opacity: animation, child: child),
      ),
    );
  }

  @override
  void dispose() {
    _controller.removeStatusListener(_onAnimationStatus);
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
      ),
      child: Scaffold(
        body: LayoutBuilder(
          builder: (context, constraints) {
            final width = constraints.maxWidth;
            final height = constraints.maxHeight;
            final logoWidth = math.min(width * 0.74, 310.0);

            return AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                final logoIn = Curves.easeOutCubic.transform(
                  (_controller.value / 0.34).clamp(0.0, 1.0),
                );
                final waveRise = Curves.easeInOutCubic.transform(
                  ((_controller.value - 0.36) / 0.64).clamp(0.0, 1.0),
                );

                return Stack(
                  fit: StackFit.expand,
                  children: [
                    const DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Color(0xFFF9FEFF),
                            Color(0xFFECFBFF),
                            Color(0xFFE6F8FF),
                          ],
                        ),
                      ),
                    ),
                    Center(
                      child: Container(
                        width: math.min(width * 0.96, 400),
                        height: math.min(width * 0.96, 400),
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: RadialGradient(
                            colors: [
                              Color(0x6683E7DC),
                              Color(0x3358C8F4),
                              Color(0x0058C8F4),
                            ],
                            stops: [0, 0.55, 1],
                          ),
                        ),
                      ),
                    ),
                    Center(
                      child: Container(
                        width: math.min(width * 0.78, 330),
                        height: math.min(width * 0.78, 330),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: const Color(
                              0xFF7CCBEA,
                            ).withValues(alpha: 0.22 * logoIn),
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                    Center(
                      child: Container(
                        width: math.min(width * 0.97, 420),
                        height: math.min(width * 0.97, 420),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: const Color(
                              0xFF7CCBEA,
                            ).withValues(alpha: 0.12 * logoIn),
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                    _Bubble(left: width * 0.12, top: height * 0.25, size: 21),
                    _Bubble(left: width * 0.21, top: height * 0.21, size: 9),
                    _Bubble(left: width * 0.87, top: height * 0.45, size: 25),
                    _Bubble(left: width * 0.09, top: height * 0.60, size: 12),
                    Center(
                      child: Opacity(
                        opacity: logoIn,
                        child: Transform.scale(
                          scale: 0.92 + 0.08 * logoIn,
                          child: Image.asset(
                            'assets/images/logo.png',
                            width: logoWidth,
                            fit: BoxFit.contain,
                          ),
                        ),
                      ),
                    ),
                    Positioned.fill(
                      child: CustomPaint(
                        painter: _WaterPainter(progress: waveRise),
                      ),
                    ),
                  ],
                );
              },
            );
          },
        ),
      ),
    );
  }
}

class _Bubble extends StatelessWidget {
  const _Bubble({required this.left, required this.top, required this.size});

  final double left;
  final double top;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: left,
      top: top,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: const Color(0x337BCDF1),
          border: Border.all(color: const Color(0x887BCDF1), width: 1.2),
          boxShadow: const [BoxShadow(color: Color(0x223DB5E4), blurRadius: 8)],
        ),
      ),
    );
  }
}

class _WaterPainter extends CustomPainter {
  const _WaterPainter({required this.progress});

  final double progress;

  @override
  void paint(Canvas canvas, Size size) {
    final waterLine = size.height * (0.78 - 1.06 * progress);
    final amplitude = size.height * 0.025;

    Path wave(double offset) => Path()
      ..moveTo(0, waterLine + offset)
      ..cubicTo(
        size.width * 0.28,
        waterLine - amplitude + offset,
        size.width * 0.55,
        waterLine + amplitude * 1.7 + offset,
        size.width,
        waterLine - amplitude * 0.4 + offset,
      )
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..close();

    canvas.drawPath(
      wave(-size.height * 0.032),
      Paint()..color = const Color(0xFFB8EFF7),
    );
    canvas.drawPath(wave(0), Paint()..color = const Color(0xFF74CDF1));
    canvas.drawPath(
      wave(size.height * 0.055),
      Paint()..color = const Color(0xFF58B7EC),
    );
  }

  @override
  bool shouldRepaint(covariant _WaterPainter oldDelegate) =>
      oldDelegate.progress != progress;
}
