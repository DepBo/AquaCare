import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';

enum TankShieldLevel { waiting, safe, warning, danger }

/// Mirrors the web overview: one dangerous reading wins, otherwise every
/// reading must be present and good for a green shield.
TankShieldLevel tankShieldLevel(Iterable<String> statuses) {
  final values = statuses.toList();
  if (values.every((status) => status == 'Chưa có dữ liệu')) {
    return TankShieldLevel.waiting;
  }
  if (values.any((status) => status == 'Nguy hiểm' || status == 'Cạn nước')) {
    return TankShieldLevel.danger;
  }
  if (values.length == 4 &&
      values.every((status) => status == 'Tốt' || status == 'Ổn định')) {
    return TankShieldLevel.safe;
  }
  return TankShieldLevel.warning;
}

/// The image and its overlay share a real cutout; the button is outside it.
class TankOverviewHero extends StatefulWidget {
  const TankOverviewHero({
    super.key,
    required this.title,
    required this.subtitle,
    required this.shieldLevel,
    required this.onAddTank,
  });

  final String title;
  final String subtitle;
  final TankShieldLevel shieldLevel;
  final VoidCallback onAddTank;

  @override
  State<TankOverviewHero> createState() => _TankOverviewHeroState();
}

class _TankOverviewHeroState extends State<TankOverviewHero>
    with WidgetsBindingObserver {
  Timer? _timer;
  int _slide = 0;
  bool _loadingSlide = false;

  String _asset(int slide) => 'assets/images/pond-fish${slide + 1}.jpg';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (!mounted ||
          !TickerMode.valuesOf(context).enabled ||
          MediaQuery.disableAnimationsOf(context)) {
        return;
      }
      _advanceSlide();
    });
  }

  Future<bool> _loadSlide(int slide) async {
    var loaded = true;
    await precacheImage(
      AssetImage(_asset(slide)),
      context,
      onError: (error, stackTrace) {
        loaded = false;
        debugPrint('Cannot load ${_asset(slide)}: $error');
      },
    );
    return loaded;
  }

  Future<void> _advanceSlide() async {
    if (_loadingSlide) return;
    _loadingSlide = true;
    final next = (_slide + 1) % 9;
    final loaded = await _loadSlide(next);
    _loadingSlide = false;
    if (!mounted || !loaded) return;
    setState(() => _slide = next);
    _preloadNext();
  }

  void _preloadNext() {
    _loadSlide((_slide + 1) % 9);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _preloadNext();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _startTimer();
    } else {
      _timer?.cancel();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final darkMode = Theme.of(context).brightness == Brightness.dark;
    final buttonBackground = darkMode ? Colors.white : const Color(0xFF111722);
    final buttonForeground = darkMode ? const Color(0xFF111722) : Colors.white;
    final scaler = MediaQuery.textScalerOf(context);
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final buttonScaler = TextScaler.linear(math.min(scaler.scale(1), 1.2));
        final contentScaler = TextScaler.linear(
          math.min(scaler.scale(1), width < 380 ? 1.2 : 2.0),
        );
        final label = TextPainter(
          text: const TextSpan(
            text: 'Thêm bể',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
          ),
          textDirection: TextDirection.ltr,
          textScaler: buttonScaler,
        )..layout();
        final buttonWidth = math.min(
          width - 64,
          math.max(144.0, label.width + 66),
        );
        final buttonHeight = math.max(49.0, label.height + 24);
        label.dispose();
        const gap = 7.0;
        final textWidth = width - buttonWidth - 36;
        final copyWidth = math.max(1.0, textWidth);
        final titleStyle = const TextStyle(
          color: Colors.white,
          fontSize: 17,
          fontWeight: FontWeight.w800,
          height: 1.15,
        );
        final subtitleStyle = const TextStyle(
          color: Color(0xFFE1E9ED),
          fontSize: 10,
          height: 1.35,
        );
        double textHeight(String text, TextStyle style) {
          final painter = TextPainter(
            text: TextSpan(text: text, style: style),
            textDirection: Directionality.of(context),
            textScaler: contentScaler,
          )..layout(maxWidth: copyWidth);
          final height = painter.height;
          painter.dispose();
          return height;
        }

        final copyHeight =
            textHeight(widget.title, titleStyle) +
            5 +
            textHeight(widget.subtitle, subtitleStyle);
        const statusBottom = 18.0;
        final height = math.max(
          (width * 285 / 382).clamp(245.0, 360.0),
          16 + 68 + 12 + copyHeight + statusBottom,
        );
        return SizedBox(
          height: height,
          child: Stack(
            children: [
              Positioned.fill(
                child: ClipPath(
                  clipper: TankHeroClipper(
                    buttonWidth: buttonWidth,
                    buttonHeight: buttonHeight,
                  ),
                  child: ColoredBox(
                    color: const Color(0xFF15202F),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 1400),
                          layoutBuilder: (currentChild, previousChildren) =>
                              Stack(
                                fit: StackFit.expand,
                                children: [...previousChildren, ?currentChild],
                              ),
                          switchInCurve: Curves.easeInOut,
                          switchOutCurve: Curves.easeInOut,
                          child: Image.asset(
                            _asset(_slide),
                            key: ValueKey(_slide),
                            width: double.infinity,
                            height: double.infinity,
                            fit: BoxFit.cover,
                            excludeFromSemantics: true,
                            errorBuilder: (context, error, stackTrace) =>
                                Image.asset(
                                  'assets/images/overview_aquarium.png',
                                  width: double.infinity,
                                  height: double.infinity,
                                  fit: BoxFit.cover,
                                  excludeFromSemantics: true,
                                ),
                          ),
                        ),
                        const DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [Color(0x14000000), Color(0xD6000000)],
                              stops: [0.3, 1],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Positioned(
                left: 18,
                width: textWidth,
                bottom: statusBottom,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildShield(),
                    const SizedBox(height: 12),
                    Text(
                      widget.title,
                      style: titleStyle,
                      textScaler: contentScaler,
                    ),
                    const SizedBox(height: 5),
                    Text(
                      widget.subtitle,
                      style: subtitleStyle,
                      textScaler: contentScaler,
                    ),
                  ],
                ),
              ),
              Positioned(
                right: gap,
                bottom: gap,
                width: buttonWidth,
                height: buttonHeight,
                child: Semantics(
                  label: 'Thêm bể cá',
                  button: true,
                  child: Material(
                    color: buttonBackground,
                    borderRadius: BorderRadius.circular(buttonHeight / 2),
                    clipBehavior: Clip.antiAlias,
                    child: InkWell(
                      onTap: widget.onAddTank,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            CircleAvatar(
                              radius: 12,
                              backgroundColor: buttonForeground,
                              child: Icon(
                                Icons.add,
                                color: buttonBackground,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Flexible(
                              child: Text(
                                'Thêm bể',
                                textScaler: buttonScaler,
                                style: TextStyle(
                                  color: buttonForeground,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
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

  Widget _buildShield() {
    final (background, asset) = switch (widget.shieldLevel) {
      TankShieldLevel.safe => (
        const Color(0xFFDCF7F1),
        'assets/images/status-shield-safe.png',
      ),
      TankShieldLevel.warning => (
        const Color(0xFFFFF3D9),
        'assets/images/status-shield-warning.png',
      ),
      TankShieldLevel.danger => (
        const Color(0xFFFDE8E8),
        'assets/images/status-shield-danger.png',
      ),
      TankShieldLevel.waiting => (const Color(0xFFE9F0F4), null),
    };
    return Semantics(
      label: switch (widget.shieldLevel) {
        TankShieldLevel.safe => 'Khiên xanh: an toàn',
        TankShieldLevel.warning => 'Khiên vàng: cần theo dõi',
        TankShieldLevel.danger => 'Khiên đỏ: nguy hiểm',
        TankShieldLevel.waiting => 'Khiên xám: chờ dữ liệu',
      },
      image: true,
      child: Container(
        width: 68,
        height: 68,
        decoration: BoxDecoration(color: background, shape: BoxShape.circle),
        alignment: Alignment.center,
        child: asset == null
            ? const Icon(
                Icons.shield_outlined,
                size: 52,
                color: Color(0xFF97A9B8),
              )
            : Image.asset(
                asset,
                width: 58,
                height: 58,
                fit: BoxFit.contain,
                excludeFromSemantics: true,
              ),
      ),
    );
  }
}

/// Circular arcs meet with matching tangents, including the inverted corner.
/// All outer corners use the same radius; the cutout tracks the pill size.
class TankHeroClipper extends CustomClipper<Path> {
  const TankHeroClipper({
    required this.buttonWidth,
    required this.buttonHeight,
  });
  final double buttonWidth;
  final double buttonHeight;

  @override
  Path getClip(Size size) {
    const gap = 7.0;
    final left = size.width - buttonWidth - gap * 2;
    final top = size.height - buttonHeight - gap * 2;
    final radius = math.min(26.0, left / 2);
    final inner = buttonHeight / 2 + gap;
    return Path()
      ..moveTo(radius, 0)
      ..lineTo(size.width - radius, 0)
      ..arcToPoint(Offset(size.width, radius), radius: Radius.circular(radius))
      ..lineTo(size.width, top - radius)
      ..arcToPoint(
        Offset(size.width - radius, top),
        radius: Radius.circular(radius),
      )
      ..lineTo(left + inner, top)
      ..arcToPoint(
        Offset(left, top + inner),
        radius: Radius.circular(inner),
        clockwise: false,
      )
      ..lineTo(left, size.height - radius)
      ..arcToPoint(
        Offset(left - radius, size.height),
        radius: Radius.circular(radius),
      )
      ..lineTo(radius, size.height)
      ..arcToPoint(
        Offset(0, size.height - radius),
        radius: Radius.circular(radius),
      )
      ..lineTo(0, radius)
      ..arcToPoint(Offset(radius, 0), radius: Radius.circular(radius))
      ..close();
  }

  @override
  bool shouldReclip(TankHeroClipper oldClipper) =>
      oldClipper.buttonWidth != buttonWidth ||
      oldClipper.buttonHeight != buttonHeight;
}
