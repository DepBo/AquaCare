import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class FloatingRoleNavItem {
  final String label;
  final String symbol;
  final int badgeCount;
  final Color? badgeColor;
  final VoidCallback onTap;

  const FloatingRoleNavItem({
    required this.label,
    required this.symbol,
    required this.onTap,
    this.badgeCount = 0,
    this.badgeColor,
  });
}

class FloatingRoleNav extends StatelessWidget {
  final List<FloatingRoleNavItem> items;
  final int selectedIndex;
  final bool isDark;

  const FloatingRoleNav({
    super.key,
    required this.items,
    required this.selectedIndex,
    required this.isDark,
  });

  static const _symbols = <String, String>{
    'fish':
        '<path d="M3 12c3-5 8-7 13-4l5-3v14l-5-3c-5 3-10 1-13-4Z"/><circle cx="14" cy="11" r="1" fill="#000" stroke="none"/><path d="M3 12 1 8m2 4-2 4"/>',
    'device':
        '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 4v16m3-12h5m-5 4h5m-5 4h3"/>',
    'staff':
        '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M5.5 17c.5-2 2-3 3.5-3s3 1 3.5 3M15 9h3m-3 4h3"/>',
    'cart':
        '<path d="M2 4h2l2 12h13l2-9H5"/><circle cx="8" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
    'layers': '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
    'packing':
        '<path d="M3 7 12 3l9 4v11l-9 4-9-4V7Zm0 0 9 4 9-4m-9 4v11M8 5l9 4"/>',
    'board':
        '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="5" rx="1"/><rect x="13" y="10" width="8" height="11" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/>',
    'support':
        '<path d="M4 13v-2a8 8 0 0 1 16 0v2M4 13h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 1-2Zm16 0h-3v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-1-2ZM17 19c0 2-2 3-5 3h-2"/>',
    'history': '<path d="M3 11a9 9 0 1 1 2 6M3 5v6h6M12 7v5l4 2"/>',
  };

  @override
  Widget build(BuildContext context) {
    const activeColor = Color(0xFF0284C7);
    final inactiveColor = isDark
        ? const Color(0xFFA1A1AA)
        : const Color(0xFF64748B);

    return SafeArea(
      top: false,
      child: Container(
        margin: const EdgeInsets.only(left: 32, right: 32, bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 5),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1F1F1F) : Colors.white,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(
            color: isDark ? const Color(0xFF333333) : const Color(0xFFCBD5E1),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.08),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: List.generate(items.length, (index) {
            final item = items[index];
            final selected = index == selectedIndex;
            return Expanded(
              child: Semantics(
                button: true,
                selected: selected,
                label: item.label,
                child: InkWell(
                  onTap: item.onTap,
                  borderRadius: BorderRadius.circular(24),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: selected
                          ? activeColor.withValues(alpha: 0.14)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Center(
                      child: Stack(
                        clipBehavior: Clip.none,
                        children: [
                          SvgPicture.string(
                            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${_symbols[item.symbol]}</svg>',
                            width: 22,
                            height: 22,
                            colorFilter: ColorFilter.mode(
                              selected ? activeColor : inactiveColor,
                              BlendMode.srcIn,
                            ),
                          ),
                          if (item.badgeCount > 0)
                            Positioned(
                              right: -11,
                              top: -7,
                              child: Container(
                                constraints: const BoxConstraints(minWidth: 17),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 4,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: item.badgeColor ?? activeColor,
                                  borderRadius: BorderRadius.circular(10),
                                  boxShadow: [
                                    BoxShadow(
                                      color: (item.badgeColor ?? activeColor)
                                          .withValues(alpha: 0.35),
                                      blurRadius: 4,
                                      offset: const Offset(0, 1),
                                    ),
                                  ],
                                ),
                                child: Text(
                                  item.badgeCount > 99
                                      ? '99+'
                                      : '${item.badgeCount}',
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 9,
                                    fontWeight: FontWeight.w800,
                                  ),
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
          }),
        ),
      ),
    );
  }
}
