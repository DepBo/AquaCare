import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

// SVG paths share a 24 × 24 view box and remain sharp at every text scale.
Widget revenueIcon(String name, Color color, {double size = 20}) {
  const paths = <String, String>{
    'chevron': '<path d="m6 9 6 6 6-6"/>',
    'up': '<path d="m6 15 6-6 6 6"/>',
    'info': '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
    'trophy':
        '<path d="M8 3h8v6a4 4 0 0 1-8 0V3Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 2v5m-4 3h8m-6-3h4v3"/>',
    'calendar':
        '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>',
    'rise': '<path d="m3 17 6-6 4 4 8-10m-6 0h6v6"/>',
    'fall': '<path d="m3 7 6 6 4-4 8 10m-6 0h6v-6"/>',
  };
  return SvgPicture.string(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>',
    width: size,
    height: size,
    colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
    excludeFromSemantics: true,
  );
}

class _Panel extends StatelessWidget {
  const _Panel({required this.dark, required this.child});
  final bool dark;
  final Widget child;
  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: dark ? const Color(0xFF1F1F1F) : Colors.white,
      border: Border.all(
        color: dark ? const Color(0xFF333333) : const Color(0xFFDCE5EB),
      ),
      borderRadius: BorderRadius.circular(18),
    ),
    child: DefaultTextStyle.merge(
      style: TextStyle(
        color: dark ? const Color(0xFFF4F4F5) : const Color(0xFF0F172A),
        fontSize: 13,
      ),
      child: child,
    ),
  );
}

const _teal = Color(0xFF078F71);
const _red = Color(0xFFD25757);
const _blue = Color(0xFF2B648D);
const _average = Color(0xFFAA4B4B);
const _titleStyle = TextStyle(fontSize: 16, fontWeight: FontWeight.w800);
String _percent(dynamic value) => value is num
    ? '${value > 0 ? '+' : ''}${value.toStringAsFixed(2).replaceAll('.', ',')}%'
    : '—';

/// Fixed flex proportions keep columns inside the card. Text may wrap rather
/// than being clipped, including large currency amounts and accessibility text.
Widget _columns(List<String> values, {bool bold = false, Color? lastColor}) =>
    Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (var i = 0; i < values.length; i++)
          Expanded(
            flex: i == 1 ? 5 : 3,
            child: Padding(
              padding: EdgeInsets.only(right: i == values.length - 1 ? 0 : 8),
              child: Text(
                values[i],
                textAlign: i == 0 ? TextAlign.left : TextAlign.right,
                style: TextStyle(
                  fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
                  color: i == values.length - 1 ? lastColor : null,
                ),
              ),
            ),
          ),
      ],
    );

class RevenueTrendPanel extends StatelessWidget {
  const RevenueTrendPanel({
    super.key,
    required this.dark,
    required this.months,
    required this.year,
    required this.years,
    required this.onYearChanged,
    required this.money,
  });
  final bool dark;
  final List<Map<String, dynamic>> months;
  final int year;
  final List<int> years;
  final ValueChanged<int> onYearChanged;
  final String Function(dynamic) money;

  @override
  Widget build(BuildContext context) {
    final maxValue = months.fold<double>(0, (peak, month) {
      final revenue = (month['revenue'] as num?)?.toDouble() ?? 0;
      final average = (month['movingAverage'] as num?)?.toDouble() ?? 0;
      return [peak, revenue, average].reduce((a, b) => a > b ? a : b);
    });
    final unit = maxValue >= 1000000000 ? 1000000000.0 : 1000000.0;
    final chartMax = maxValue > 0 ? maxValue / unit * 1.15 : 1.0;
    final total = months.fold<num>(
      0,
      (sum, month) => sum + ((month['revenue'] as num?) ?? 0),
    );
    final muted = dark ? const Color(0xFFA1A1AA) : const Color(0xFF64748B);
    Widget legend(Color color, String text) => Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 14, height: 3, color: color),
        const SizedBox(width: 6),
        Flexible(child: Text(text)),
      ],
    );
    List<FlSpot> spots(String key) => [
      for (final month in months)
        if (month[key] is num)
          FlSpot(
            ((month['month'] as num).toDouble() - 1),
            (month[key] as num).toDouble() / unit,
          )
        else
          FlSpot.nullSpot,
    ];
    return Column(
      children: [
        _Panel(
          dark: dark,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Xu hướng doanh thu theo tháng', style: _titleStyle),
              DropdownButton<int>(
                value: year,
                isExpanded: true,
                style: TextStyle(
                  color: dark
                      ? const Color(0xFFF4F4F5)
                      : const Color(0xFF0F172A),
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
                dropdownColor: dark ? const Color(0xFF1F1F1F) : Colors.white,
                icon: revenueIcon('chevron', muted),
                items: [
                  for (final option in years)
                    DropdownMenuItem(value: option, child: Text('Năm $option')),
                ],
                onChanged: (value) {
                  if (value != null) onYearChanged(value);
                },
              ),
              Text(
                'Đơn đã giao theo ngày tạo đơn · Giờ Việt Nam',
                style: TextStyle(fontSize: 11, color: muted),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 14,
                runSpacing: 8,
                children: [
                  legend(_blue, 'Doanh thu'),
                  legend(_average, 'TB động 3 tháng'),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                unit == 1000000000 ? 'Tỷ đồng' : 'Triệu đồng',
                style: TextStyle(color: muted, fontSize: 12),
              ),
              const SizedBox(height: 12),
              LayoutBuilder(
                builder: (context, constraints) {
                  final axisFont = MediaQuery.textScalerOf(context).scale(10);
                  final stride = (constraints.maxWidth - 48) / 12 < axisFont * 2
                      ? 2
                      : 1;
                  return SizedBox(
                    height: 230 + axisFont,
                    child: LineChart(
                      LineChartData(
                        minX: 0,
                        maxX: 11,
                        minY: 0,
                        maxY: chartMax,
                        borderData: FlBorderData(show: false),
                        gridData: FlGridData(
                          drawVerticalLine: false,
                          getDrawingHorizontalLine: (_) => FlLine(
                            color: muted.withValues(alpha: .18),
                            strokeWidth: 1,
                          ),
                        ),
                        lineTouchData: LineTouchData(
                          touchTooltipData: LineTouchTooltipData(
                            fitInsideHorizontally: true,
                            fitInsideVertically: true,
                            maxContentWidth: 180,
                            getTooltipItems: (touched) => touched
                                .map(
                                  (spot) => LineTooltipItem(
                                    'Tháng ${spot.x.toInt() + 1}\n${spot.barIndex == 0 ? 'Doanh thu' : 'TB 3 tháng'}\n${money(spot.y * unit)}',
                                    const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                )
                                .toList(),
                          ),
                        ),
                        titlesData: FlTitlesData(
                          topTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                          rightTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                          leftTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              reservedSize: 28 + axisFont,
                              interval: chartMax / 4,
                              maxIncluded: false,
                              getTitlesWidget: (value, meta) => Text(
                                value.toStringAsFixed(
                                  value < 10 && value != value.roundToDouble()
                                      ? 1
                                      : 0,
                                ),
                                style: TextStyle(fontSize: 10, color: muted),
                              ),
                            ),
                          ),
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              reservedSize: 20 + axisFont,
                              interval: 1,
                              getTitlesWidget: (value, meta) =>
                                  stride == 2 && value.toInt().isEven
                                  ? const SizedBox.shrink()
                                  : Padding(
                                      padding: const EdgeInsets.only(top: 8),
                                      child: Text(
                                        '${value.toInt() + 1}',
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: muted,
                                        ),
                                      ),
                                    ),
                            ),
                          ),
                        ),
                        lineBarsData: [
                          LineChartBarData(
                            spots: spots('revenue'),
                            color: _blue,
                            barWidth: 2.5,
                            dotData: const FlDotData(show: false),
                          ),
                          LineChartBarData(
                            spots: spots('movingAverage'),
                            color: _average,
                            barWidth: 2.5,
                            dotData: const FlDotData(show: false),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 8),
              Text(
                'Chạm biểu đồ để xem doanh thu từng tháng',
                style: TextStyle(fontSize: 12, color: muted),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        _Panel(
          dark: dark,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Chi tiết theo tháng', style: _titleStyle),
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.only(left: 10, right: 38),
                child: _columns([
                  'Tháng',
                  'Doanh thu',
                  'Tăng trưởng',
                ], bold: true),
              ),
              const SizedBox(height: 8),
              for (final month in months)
                _MonthRow(
                  key: ValueKey('$year-${month['month']}'),
                  month: month,
                  money: money,
                  dark: dark,
                ),
              const SizedBox(height: 12),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  revenueIcon('info', muted, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Chạm một tháng để xem trung bình động 3 tháng.',
                      style: TextStyle(fontSize: 12, color: muted),
                    ),
                  ),
                ],
              ),
              const Divider(height: 28),
              _columns(['Tổng năm', money(total)], bold: true),
            ],
          ),
        ),
      ],
    );
  }
}

class _MonthRow extends StatefulWidget {
  const _MonthRow({
    super.key,
    required this.month,
    required this.money,
    required this.dark,
  });
  final Map<String, dynamic> month;
  final String Function(dynamic) money;
  final bool dark;
  @override
  State<_MonthRow> createState() => _MonthRowState();
}

class _MonthRowState extends State<_MonthRow> {
  bool expanded = false;
  @override
  Widget build(BuildContext context) {
    final growth = widget.month['growthPercent'];
    return Container(
      decoration: BoxDecoration(
        color: expanded
            ? _teal.withValues(alpha: widget.dark ? .18 : .07)
            : null,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Semantics(
            button: true,
            expanded: expanded,
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: () => setState(() => expanded = !expanded),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 16,
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: _columns(
                        [
                          'T${widget.month['month']}',
                          widget.month['revenue'] == null
                              ? '—'
                              : widget.money(widget.month['revenue']),
                          _percent(growth),
                        ],
                        lastColor: growth is num
                            ? (growth < 0 ? _red : _teal)
                            : null,
                      ),
                    ),
                    const SizedBox(width: 8),
                    revenueIcon(expanded ? 'up' : 'chevron', _teal),
                  ],
                ),
              ),
            ),
          ),
          if (expanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 0, 10, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Trung bình động 3 tháng',
                    style: TextStyle(fontSize: 12),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.month['movingAverage'] == null
                        ? '—'
                        : widget.money(widget.month['movingAverage']),
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class VersionRevenuePanel extends StatelessWidget {
  const VersionRevenuePanel({
    super.key,
    required this.dark,
    required this.versions,
    required this.month,
    required this.year,
    required this.months,
    required this.years,
    required this.onMonthChanged,
    required this.onYearChanged,
    required this.money,
  });
  final bool dark;
  final Map<String, dynamic> versions;
  final int month, year;
  final List<int> months, years;
  final ValueChanged<int> onMonthChanged, onYearChanged;
  final String Function(dynamic) money;
  @override
  Widget build(BuildContext context) {
    const names = ['V1', 'V2', 'V3', 'V4'];
    final values = names.map((name) => (versions[name] as num?) ?? 0).toList();
    final total = values.fold<num>(0, (a, b) => a + b);
    final highest = values.reduce((a, b) => a > b ? a : b);
    final lowest = values.reduce((a, b) => a < b ? a : b);
    Widget filter(
      int value,
      List<int> options,
      ValueChanged<int> callback,
      bool isMonth,
    ) => DropdownButton<int>(
      value: options.contains(value) ? value : null,
      isExpanded: true,
      style: TextStyle(
        color: dark ? const Color(0xFFF4F4F5) : const Color(0xFF0F172A),
        fontSize: 14,
        fontWeight: FontWeight.w600,
      ),
      dropdownColor: dark ? const Color(0xFF1F1F1F) : Colors.white,
      hint: Text(isMonth ? 'Tháng' : 'Năm'),
      icon: revenueIcon('chevron', _teal),
      items: [
        for (final option in options)
          DropdownMenuItem(
            value: option,
            child: Text(isMonth ? 'Tháng ${option + 1}' : '$option'),
          ),
      ],
      onChanged: (selected) {
        if (selected != null) callback(selected);
      },
    );
    return _Panel(
      dark: dark,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Doanh thu theo phiên bản', style: _titleStyle),
          Wrap(
            spacing: 16,
            children: [
              SizedBox(
                width: 120,
                child: filter(month, months, onMonthChanged, true),
              ),
              SizedBox(
                width: 100,
                child: filter(year, years, onYearChanged, false),
              ),
            ],
          ),
          const Text(
            'Đơn đã giao · Doanh thu thiết bị',
            style: TextStyle(fontSize: 11),
          ),
          const SizedBox(height: 16),
          _columns(['Phiên bản', 'Doanh thu', 'Tỷ trọng'], bold: true),
          const SizedBox(height: 8),
          for (var i = 0; i < names.length; i++)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 4),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                color: total > 0 && highest != lowest && values[i] == highest
                    ? _teal.withValues(alpha: dark ? .22 : .10)
                    : total > 0 && highest != lowest && values[i] == lowest
                    ? _red.withValues(alpha: dark ? .18 : .08)
                    : null,
              ),
              child: _columns([
                '${names[i]}${total > 0 && highest != lowest
                    ? values[i] == highest
                          ? '\nCao nhất'
                          : values[i] == lowest
                          ? '\nThấp nhất'
                          : ''
                    : ''}',
                money(values[i]),
                total > 0
                    ? '${(values[i] / total * 100).toStringAsFixed(1).replaceAll('.', ',')}%'
                    : '—',
              ]),
            ),
          const Divider(height: 24),
          _columns([
            'Tổng',
            money(total),
            total > 0 ? '100%' : '—',
          ], bold: true),
        ],
      ),
    );
  }
}

class RevenueHighlightsPanel extends StatelessWidget {
  const RevenueHighlightsPanel({
    super.key,
    required this.dark,
    required this.year,
    required this.highlights,
    required this.money,
  });
  final bool dark;
  final int year;
  final Map<String, dynamic> highlights;
  final String Function(dynamic) money;
  @override
  Widget build(BuildContext context) {
    Widget item(String icon, String label, String result, Color color) =>
        Container(
          margin: const EdgeInsets.only(top: 12),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: color.withValues(alpha: .2)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: .12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: revenueIcon(icon, color),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label, style: const TextStyle(fontSize: 12)),
                    const SizedBox(height: 4),
                    Text(
                      result,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
    final peakMonth = highlights['peakMonth'];
    return _Panel(
      dark: dark,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Điểm nổi bật', style: _titleStyle),
          const SizedBox(height: 4),
          Text('Năm $year'),
          item(
            'trophy',
            'Doanh thu tháng cao nhất',
            money(highlights['peakMonthlyRevenue'] ?? 0),
            const Color(0xFFE9A53A),
          ),
          item(
            'calendar',
            'Tháng doanh thu cao nhất',
            peakMonth is num && peakMonth >= 1 && peakMonth <= 12
                ? 'Tháng $peakMonth'
                : '—',
            _blue,
          ),
          item(
            'rise',
            'Tăng trưởng cao nhất',
            _percent(highlights['maxGrowthPercent']),
            _teal,
          ),
          item(
            'fall',
            'Giảm mạnh nhất',
            _percent(highlights['maxDeclinePercent']),
            _red,
          ),
        ],
      ),
    );
  }
}
