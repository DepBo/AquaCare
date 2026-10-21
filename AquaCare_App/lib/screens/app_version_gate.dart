import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import '../services/app_version_service.dart';

/// Prevents navigation into the app until the published minimum build is known.
class AppVersionGate extends StatefulWidget {
  const AppVersionGate({
    super.key,
    required this.destination,
    this.checkVersion,
  });

  final Widget destination;
  final Future<AppVersionResult> Function()? checkVersion;

  @override
  State<AppVersionGate> createState() => _AppVersionGateState();
}

class _AppVersionGateState extends State<AppVersionGate>
    with WidgetsBindingObserver {
  AppVersionResult? _result;
  bool _checking = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _check();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && !_checking) _check();
  }

  Future<void> _check() async {
    if (!mounted) return;
    setState(() {
      _checking = true;
      _error = null;
    });
    try {
      final result = await (widget.checkVersion ?? AppVersionService.check)();
      if (!mounted) return;
      setState(() {
        _result = result;
        _checking = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error =
            'Không thể kiểm tra phiên bản. Hãy kiểm tra kết nối mạng rồi thử lại.';
        _checking = false;
      });
    }
  }

  Future<void> _openDownloadPage() async {
    try {
      final opened = await launchUrl(
        Uri.parse(appDownloadPage),
        mode: LaunchMode.externalApplication,
      );
      if (!opened) throw Exception('Không mở được trình duyệt');
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Không mở được trang tải app. Hãy thử lại.'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final blocked =
        _checking || _error != null || _result?.updateRequired == true;
    final updateRequired = _result?.updateRequired == true;
    return Stack(
      children: [
        TickerMode(
          enabled: !blocked,
          child: Offstage(offstage: blocked, child: widget.destination),
        ),
        if (blocked) _buildBlockingScreen(updateRequired),
      ],
    );
  }

  Widget _buildBlockingScreen(bool updateRequired) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: const Color(0xFFF1FAFC),
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 400),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Image.asset(
                      'assets/images/logo.png',
                      width: 150,
                      height: 150,
                    ),
                    const SizedBox(height: 24),
                    if (_checking) ...[
                      const CircularProgressIndicator(color: Color(0xFF009E9A)),
                      const SizedBox(height: 20),
                      const Text(
                        'Đang kiểm tra phiên bản...',
                        textAlign: TextAlign.center,
                      ),
                    ] else ...[
                      Text(
                        updateRequired
                            ? 'Đã có phiên bản AquaCare mới'
                            : 'Không thể kiểm tra phiên bản',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF082D42),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        updateRequired
                            ? 'Vui lòng cập nhật lên phiên bản ${_result?.latestVersion} để tiếp tục sử dụng AquaCare.'
                            : _error ?? '',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 16,
                          color: Color(0xFF607987),
                        ),
                      ),
                      const SizedBox(height: 28),
                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: FilledButton(
                          onPressed: updateRequired
                              ? _openDownloadPage
                              : _check,
                          style: FilledButton.styleFrom(
                            backgroundColor: const Color(0xFF009E9A),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          child: Text(
                            updateRequired ? 'Cập nhật ngay' : 'Thử lại',
                          ),
                        ),
                      ),
                    ],
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
