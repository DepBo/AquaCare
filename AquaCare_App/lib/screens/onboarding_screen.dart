import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key, required this.destination});

  final Widget destination;

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen>
    with SingleTickerProviderStateMixin {
  static const _screenshots = [
    'assets/images/onboarding_controls.jpg',
    'assets/images/onboarding_overview.jpg',
    'assets/images/onboarding_sensors.jpg',
    'assets/images/onboarding_alerts.jpg',
  ];

  late final AnimationController _drift = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 44),
  )..repeat();

  bool _opening = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    for (final screenshot in _screenshots) {
      precacheImage(AssetImage(screenshot), context);
    }
  }

  void _getStarted() {
    if (_opening) return;
    setState(() => _opening = true);

    Navigator.of(context).pushReplacement(
      PageRouteBuilder<void>(
        pageBuilder: (context, animation, secondaryAnimation) =>
            AnnotatedRegion<SystemUiOverlayStyle>(
              value: const SystemUiOverlayStyle(
                statusBarColor: Colors.transparent,
                statusBarIconBrightness: Brightness.light,
              ),
              child: widget.destination,
            ),
        transitionDuration: const Duration(milliseconds: 350),
        transitionsBuilder: (context, animation, secondaryAnimation, child) =>
            FadeTransition(opacity: animation, child: child),
      ),
    );
  }

  @override
  void dispose() {
    _drift.dispose();
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
        backgroundColor: const Color(0xFFFFFFFF),
        body: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final compact = constraints.maxHeight < 680;

              return Column(
                children: [
                  Expanded(child: _buildShowcase()),
                  _buildBottomPanel(compact),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildShowcase() {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final cardWidth = math.min(width * 0.39, 164.0);
        final spacing = cardWidth + 14;
        final cardHeight = cardWidth * 2.22;
        final gap = cardWidth * 0.13;
        final cycleHeight = (cardHeight + gap) * _screenshots.length;
        final startingX = (width - cardWidth - 3 * spacing) / 2;

        return ClipRect(
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              const Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0xFFEAF2F7), Color(0xFFF4F8FA)],
                    ),
                  ),
                ),
              ),
              for (var column = 0; column < 4; column++)
                Positioned(
                  left: startingX + column * spacing,
                  top: 0,
                  width: cardWidth,
                  height: constraints.maxHeight,
                  child: Transform.rotate(
                    angle: 0.13,
                    child: Stack(
                      clipBehavior: Clip.none,
                      children: [
                        Positioned(
                          top: 0,
                          left: 0,
                          child: _buildMovingColumn(
                            column: column,
                            cardWidth: cardWidth,
                            cardHeight: cardHeight,
                            gap: gap,
                            cycleHeight: cycleHeight,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              const Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                height: 115,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0x00FFFFFF), Color(0xFFFFFFFF)],
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMovingColumn({
    required int column,
    required double cardWidth,
    required double cardHeight,
    required double gap,
    required double cycleHeight,
  }) {
    final phase = cardHeight * (column % 3) * 0.24;

    return AnimatedBuilder(
      animation: _drift,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(_screenshots.length * 2, (index) {
          final screenshot =
              _screenshots[(index + column) % _screenshots.length];
          return Padding(
            padding: EdgeInsets.only(bottom: gap),
            child: Container(
              width: cardWidth,
              height: cardHeight,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(17),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x1F55798B),
                    blurRadius: 13,
                    offset: Offset(0, 7),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(17),
                child: Image.asset(
                  screenshot,
                  width: cardWidth,
                  height: cardHeight,
                  fit: BoxFit.cover,
                  filterQuality: FilterQuality.low,
                ),
              ),
            ),
          );
        }),
      ),
      builder: (context, child) {
        final travel = cycleHeight * _drift.value;
        final offset = column.isEven
            ? -phase - travel
            : -cycleHeight - phase + travel;
        return Transform.translate(offset: Offset(0, offset), child: child);
      },
    );
  }

  Widget _buildBottomPanel(bool compact) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(
        20,
        compact ? 18 : 28,
        20,
        compact ? 16 : 26,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
        boxShadow: [
          BoxShadow(
            color: Color(0x16547785),
            blurRadius: 24,
            offset: Offset(0, -8),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              Expanded(
                child: _FeatureTile(
                  'Tổng quan',
                  _overviewSvg,
                  compact: compact,
                ),
              ),
              Expanded(
                child: _FeatureTile('Cảm biến', _sensorsSvg, compact: compact),
              ),
              Expanded(
                child: _FeatureTile(
                  'Điều khiển',
                  _controlsSvg,
                  compact: compact,
                ),
              ),
              Expanded(
                child: _FeatureTile('Cảnh báo', _alertsSvg, compact: compact),
              ),
            ],
          ),
          SizedBox(height: compact ? 22 : 32),
          SizedBox(
            width: double.infinity,
            height: compact ? 52 : 58,
            child: FilledButton(
              onPressed: _opening ? null : _getStarted,
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFF4DA72C),
                foregroundColor: Colors.white,
                disabledBackgroundColor: const Color(0xFF4DA72C),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                elevation: 0,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Flexible(
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        'Get Started',
                        style: TextStyle(
                          fontSize: 19,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 9),
                  SvgPicture.string(_arrowSvg, width: 20, height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FeatureTile extends StatelessWidget {
  const _FeatureTile(this.label, this.svg, {required this.compact});

  final String label;
  final String svg;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: compact ? 48 : 56,
          height: compact ? 48 : 56,
          decoration: BoxDecoration(
            color: const Color(0xFF1C382F),
            borderRadius: BorderRadius.circular(compact ? 17 : 19),
          ),
          child: Center(
            child: SvgPicture.string(
              svg,
              width: compact ? 23 : 27,
              height: compact ? 23 : 27,
            ),
          ),
        ),
        SizedBox(height: compact ? 7 : 9),
        Text(
          label,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: const Color(0xFF243B35),
            fontSize: compact ? 10 : 11,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

const _overviewSvg =
    '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#E9FFF7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>''';
const _sensorsSvg =
    '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#E9FFF7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c-2.5 4-7 9-7 13a7 7 0 0 0 14 0c0-4-4.5-9-7-13z"/><path d="M9 16a3 3 0 0 0 3 3"/></svg>''';
const _controlsSvg =
    '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#E9FFF7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="#1C382F"/><circle cx="16" cy="12" r="2" fill="#1C382F"/><circle cx="8" cy="18" r="2" fill="#1C382F"/></svg>''';
const _alertsSvg =
    '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#E9FFF7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9z"/><path d="M10 21h4"/></svg>''';
const _arrowSvg =
    '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16m-7-7 7 7-7 7"/></svg>''';
