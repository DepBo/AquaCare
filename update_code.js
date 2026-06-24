const fs = require('fs');

// -------- DashboardPage.tsx --------
const path_web = "c:/Users/Acer/Downloads/AquaCare/AquaCare_Web/src/pages/DashboardPage.tsx";
let content = fs.readFileSync(path_web, 'utf-8');

// 1. Update SensorData interface
content = content.replace(
    /interface SensorData \{[\s\S]*?\}/,
    `interface SensorData {
  ph: SensorReading[]
  tds: SensorReading[]
  temp: SensorReading[]
  waterLevel: SensorReading[]
}`
);

// 2. Update initSensor
content = content.replace(
    /function initSensor\(\): SensorData \{[\s\S]*?\}/,
    `function initSensor(): SensorData {
  return {
    ph: generateHistory(7.0, 0.3),
    tds: generateHistory(250, 30),
    temp: generateHistory(26.0, 1.0),
    waterLevel: Array.from({ length: 24 }, (_, i) => ({
      time: new Date(Date.now() - (24 - 1 - i) * 3600_000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      value: 1,
    })),
  }
}`
);

// 3. Update SENSOR_CFG
content = content.replace(
    /const SENSOR_CFG = \[[\s\S]*?\]/,
    `const SENSOR_CFG = [
  { key: 'ph' as const, label: 'pH', unit: '', icon: Activity, color: '#00A896', good: [6.5, 7.5], warn: [6.0, 8.0] },
  { key: 'temp' as const, label: 'Nhiệt độ', unit: '°C', icon: Thermometer, color: '#FF8C42', good: [24, 28], warn: [22, 30] },
  { key: 'tds' as const, label: 'TDS', unit: 'ppm', icon: Zap, color: '#C77DFF', good: [150, 300], warn: [100, 400] },
  { key: 'waterLevel' as const, label: 'Mực nước', unit: '', icon: Droplets, color: '#4DA6FF', good: [1, 1], warn: [0, 1] },
]`
);

// 4. Update statusColor and statusLabel
content = content.replace('function statusColor(val: number, good: number[], warn: number[]) {', 'function statusColor(val: number, good: number[], warn: number[], key?: string) {\\n  if (key === "waterLevel") return val === 1 ? "#00A896" : "#FF6B6B";');
content = content.replace('function statusLabel(val: number, good: number[], warn: number[]) {', 'function statusLabel(val: number, good: number[], warn: number[], key?: string) {\\n  if (key === "waterLevel") return val === 1 ? "Ổn định" : "Cạn nước";');

content = content.replace('const sc = statusColor(val, cfg.good, cfg.warn)', 'const sc = statusColor(val, cfg.good, cfg.warn, cfg.key)');
content = content.replace('const sl = statusLabel(val, cfg.good, cfg.warn)', 'const sl = statusLabel(val, cfg.good, cfg.warn, cfg.key)');

// 5. Update reloadSensor and interval
content = content.replace(
    /setSensorData\(\{\s*ph: generateHistory.*?\n.*?salinity: generateHistory.*?\n\s*\}\)/s,
    `setSensorData({
        ph: generateHistory(7.0 + (Math.random() - 0.5) * 0.4, 0.3),
        tds: generateHistory(250 + (Math.random() - 0.5) * 100, 30),
        temp: generateHistory(26.0 + (Math.random() - 0.5) * 3, 1.0),
        waterLevel: Array.from({ length: 24 }, (_, i) => ({
          time: new Date(Date.now() - (24 - 1 - i) * 3600_000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          value: 1,
        })),
      })`
);
content = content.replace(
    /return \{\s*ph: append.*?salinity: append.*?\n\s*\}/s,
    `return {
          ph: append(prev.ph, 7.0, 0.3),
          tds: append(prev.tds, 250, 30),
          temp: append(prev.temp, 26.0, 1.0),
          waterLevel: [...prev.waterLevel.slice(-23), { time: now, value: prev.waterLevel.at(-1)?.value ?? 1 }],
        }`
);

// 6. Update alerts generation
content = content.replace(
    /if \(latest < cfg\.warn\[0\] \|\| latest > cfg\.warn\[1\]\) \{[\s\S]*?\}/,
    `if (cfg.key === 'waterLevel') {
        if (latest === 0) newAlerts.push(\`⚠️ Mực nước bể cá đang ở mức thấp, vui lòng châm thêm nước!\`)
      } else {
        if (latest < cfg.warn[0] || latest > cfg.warn[1]) {
          newAlerts.push(\`⚠️ \${cfg.label} = \${latest}\${cfg.unit} — vượt ngoài ngưỡng an toàn, nguy cơ ảnh hưởng đến cá!\`)
        }
      }`
);

// 7. Update grid layout
content = content.replace("gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))'", "gridTemplateColumns: 'repeat(2, 1fr)'");

// 8. Update Overview Card for waterLevel
content = content.replace(
    /<Sparkline data=\{hist\.slice\(-16\)\} color=\{cfg\.color\} height=\{48\} width=\{220\} \/>[\s\S]*?<\/span>\n\s*<\/div>/,
    `{cfg.key === 'waterLevel' ? (
                        <div style={{ marginTop: 20, height: 48, display: 'flex', alignItems: 'center' }}>
                          <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: val === 1 ? '100%' : '10%', background: sc, borderRadius: 4, transition: 'width 600ms ease' }} />
                          </div>
                          <span style={{ marginLeft: 12, fontSize: 13, fontWeight: 600, color: sc }}>
                            {val === 1 ? 'Ổn định' : 'Cạn nước'}
                          </span>
                        </div>
                      ) : (
                        <>
                          <Sparkline data={hist.slice(-16)} color={cfg.color} height={48} width={220} />
                          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: \`\${Math.min(100, Math.max(0, ((val - cfg.warn[0]) / (cfg.warn[1] - cfg.warn[0])) * 100))}%\`, background: sc, borderRadius: 2, transition: 'width 600ms ease' }} />
                            </div>
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>{cfg.warn[0]}–{cfg.warn[1]}{cfg.unit}</span>
                          </div>
                        </>
                      )}`
);

// 9. Update Sensors Tab chart
content = content.replace(
    /<div style=\{\{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 \}\}>[\s\S]*?<\/svg>\n\s*<\/div>/,
    `{selectedSensor === 'waterLevel' ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column' }}>
                    <selectedCfg.icon size={64} color={latest[selectedSensor] === 1 ? '#00A896' : '#FF6B6B'} style={{ marginBottom: 16 }} />
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: latest[selectedSensor] === 1 ? '#00A896' : '#FF6B6B' }}>
                      {latest[selectedSensor] === 1 ? 'Mực nước Ổn định' : 'Cảnh báo Cạn nước'}
                    </h2>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <selectedCfg.icon size={18} color={selectedCfg.color} />
                          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{selectedCfg.label}</h2>
                        </div>
                        <div style={{ fontSize: 38, fontWeight: 800, color: selectedCfg.color, letterSpacing: '-0.03em' }}>
                          {latest[selectedSensor]}{selectedCfg.unit}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Khoảng an toàn</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: selectedCfg.color }}>{selectedCfg.good[0]}–{selectedCfg.good[1]}{selectedCfg.unit}</div>
                      </div>
                    </div>

                    <div style={{ width: '100%', overflowX: 'hidden' }}>
                      <svg width="100%" viewBox={\`0 0 800 120\`} preserveAspectRatio="none" style={{ height: 140 }}>
                        <defs>
                          <linearGradient id="mainGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={selectedCfg.color} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={selectedCfg.color} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {(() => {
                          const vals = selectedHistory.map(d => d.value)
                          const min = Math.min(...vals)
                          const max = Math.max(...vals)
                          const range = max - min || 1
                          const pts = vals.map((v, i) => {
                            const x = (i / (vals.length - 1)) * 800
                            const y = 110 - ((v - min) / range) * 100
                            return \`\${x},\${y}\`
                          }).join(' ')
                          return (
                            <>
                              <polygon points={\`0,120 \${pts} 800,120\`} fill="url(#mainGrad)" />
                              <polyline points={pts} fill="none" stroke={selectedCfg.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                              {[0.25, 0.5, 0.75].map(f => (
                                <line key={f} x1={0} y1={120 - f * 110} x2={800} y2={120 - f * 110} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="6 4" />
                              ))}
                              {vals.map((_, i) => {
                                if (i % 4 !== 0 && i !== vals.length - 1) return null
                                const x = (i / (vals.length - 1)) * 800
                                return <text key={i} x={x} y={118} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.25)" fontFamily={F}>{selectedHistory[i].time}</text>
                              })}
                            </>
                          )
                        })()}
                      </svg>
                    </div>
                  </>
                )}`
);

// 10. Hide stats below chart if waterLevel
content = content.replace(
    /<div style=\{\{ display: 'grid', gridTemplateColumns: 'repeat\(4,1fr\)', gap: 12 \}\}>[\s\S]*?<\/div>\n\s*<\/>/,
    `{selectedSensor !== 'waterLevel' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                    {[
                      { label: 'Hiện tại', value: \`\${latest[selectedSensor]}\${selectedCfg.unit}\` },
                      { label: 'Trung bình', value: \`\${(selectedHistory.reduce((a, d) => a + d.value, 0) / selectedHistory.length).toFixed(2)}\${selectedCfg.unit}\` },
                      { label: 'Cao nhất', value: \`\${Math.max(...selectedHistory.map(d => d.value)).toFixed(2)}\${selectedCfg.unit}\` },
                      { label: 'Thấp nhất', value: \`\${Math.min(...selectedHistory.map(d => d.value)).toFixed(2)}\${selectedCfg.unit}\` },
                    ].map(s => (
                      <div key={s.label} style={{ padding: '16px', borderRadius: 12, background: 'rgba(15,26,48,0.8)', border: \`1px solid \${selectedCfg.color}15\`, textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: selectedCfg.color }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}
            </>`
);

// 11. Alerts Hướng dẫn xử lý
content = content.replace(
    /\[\s*\{\s*icon: '💧', title: 'pH bất thường', desc: 'Sử dụng vôi để tăng pH hoặc thêm axit hữu cơ để giảm\.' \},[\s\S]*?\]\.map\(t => \(/,
    `[
                  { icon: '💧', title: 'pH bất thường', desc: 'Thay 20% nước, kiểm tra lại hệ thống lọc.' },
                  { icon: '🌡️', title: 'Nhiệt độ ngoài ngưỡng', desc: 'Kiểm tra lại quạt tản nhiệt/sưởi.' },
                  { icon: '🌊', title: 'Mực nước thấp', desc: 'Kiểm tra van cấp nước và châm thêm nước vào bể.' },
                  { icon: '⚗️', title: 'TDS cao', desc: 'Thay 20% nước để pha loãng khoáng chất.' },
                ].map(t => (`
);

// 12. Fix value display in Overview card for waterLevel
content = content.replace(
    /<div style=\{\{ fontSize: 32, fontWeight: 700, color: sc, marginBottom: 12, letterSpacing: '-0\.02em' \}\}>\n\s*\{val\}\{cfg\.unit\}\n\s*<\/div>/,
    `<div style={{ fontSize: 32, fontWeight: 700, color: sc, marginBottom: 12, letterSpacing: '-0.02em' }}>
                        {cfg.key === 'waterLevel' ? '' : \`\${val}\${cfg.unit}\`}
                      </div>`
);

fs.writeFileSync(path_web, content, 'utf-8');


// -------- dashboard_screen.dart --------
const path_app = "c:/Users/Acer/Downloads/AquaCare/AquaCare_App/lib/screens/dashboard_screen.dart";
let appContent = fs.readFileSync(path_app, 'utf-8');

// 1. Update sensorList
appContent = appContent.replace(
    /final List<SensorData> sensorList = \[[\s\S]*?\];/,
    `final List<SensorData> sensorList = [
  SensorData(
    name: 'pH',
    unit: '',
    value: 7.20,
    color: const Color(0xFF00A896),
    icon: Icons.science_outlined,
    status: 'Tốt',
    history: [7.1, 7.0, 7.2, 7.3, 7.15, 7.25, 7.20, 7.18, 7.22, 7.20],
  ),
  SensorData(
    name: 'Nhiệt độ',
    unit: '°C',
    value: 26.50,
    color: const Color(0xFFFF8C42),
    icon: Icons.thermostat_outlined,
    status: 'Tốt',
    history: [26.0, 26.3, 26.8, 27.0, 26.6, 26.4, 26.5, 26.7, 26.5, 26.5],
  ),
  SensorData(
    name: 'TDS',
    unit: 'ppm',
    value: 245.00,
    color: const Color(0xFFC77DFF),
    icon: Icons.water_drop_outlined,
    status: 'Tốt',
    history: [
      240.0,
      243.0,
      246.0,
      248.0,
      244.0,
      242.0,
      245.0,
      247.0,
      244.0,
      245.0,
    ],
  ),
  SensorData(
    name: 'Mực nước',
    unit: '',
    value: 1.0,
    color: const Color(0xFF4DA6FF),
    icon: Icons.waves_outlined,
    status: 'Ổn định',
    history: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  ),
];`
);

// 2. Update alertList
appContent = appContent.replace(
    /final List<AlertItem> alertList = \[[\s\S]*?\];/,
    `final List<AlertItem> alertList = [
  AlertItem(
    title: 'pH ổn định',
    message: 'Giá trị pH đang ở mức lý tưởng 7.2',
    time: '2 phút trước',
    color: const Color(0xFF00A896),
    icon: Icons.check_circle_outline,
    isWarning: false,
  ),
  AlertItem(
    title: 'Nhiệt độ bình thường',
    message: 'Nhiệt độ nước ổn định 26.5°C',
    time: '5 phút trước',
    color: const Color(0xFF00A896),
    icon: Icons.check_circle_outline,
    isWarning: false,
  ),
  AlertItem(
    title: 'Mực nước thấp',
    message: 'Cảnh báo cạn nước, vui lòng kiểm tra van cấp và châm thêm nước',
    time: '12 phút trước',
    color: const Color(0xFFFF6B6B),
    icon: Icons.warning_amber_outlined,
    isWarning: true,
  ),
  AlertItem(
    title: 'TDS tăng',
    message: 'Nồng độ TDS tăng lên 245 ppm, cân nhắc thay 20% nước',
    time: '30 phút trước',
    color: const Color(0xFFFF8C42),
    icon: Icons.info_outline,
    isWarning: true,
  ),
];`
);

// 3. Update _currentSensors
appContent = appContent.replace(
    /return \[\s*SensorData\([\s\S]*?\n\s*\];/,
    `return [
      SensorData(
        name: 'pH',
        unit: '',
        value: 7.0 + (rand.nextDouble() - 0.5) * 0.4,
        color: const Color(0xFF00A896),
        icon: Icons.science_outlined,
        status: 'Tốt',
        history: genHistory(7.1, 0.3),
      ),
      SensorData(
        name: 'Nhiệt độ',
        unit: '°C',
        value: 26.0 + (rand.nextDouble() - 0.5) * 3,
        color: const Color(0xFFFF8C42),
        icon: Icons.thermostat_outlined,
        status: 'Tốt',
        history: genHistory(26.5, 2.0),
      ),
      SensorData(
        name: 'TDS',
        unit: 'ppm',
        value: 250.0 + (rand.nextDouble() - 0.5) * 100,
        color: const Color(0xFFC77DFF),
        icon: Icons.water_drop_outlined,
        status: 'Tốt',
        history: genHistory(245.0, 30.0),
      ),
      SensorData(
        name: 'Mực nước',
        unit: '',
        value: 1.0,
        color: const Color(0xFF4DA6FF),
        icon: Icons.waves_outlined,
        status: 'Ổn định',
        history: List.generate(10, (_) => 1.0),
      ),
    ];`
);

// 4. Text modifications
appContent = appContent.replace("'6 hoạt động'", "'4 hoạt động'");
appContent = appContent.replace("'Tất cả 6 cảm biến trong ngưỡng an toàn'", "'Tất cả 4 cảm biến trong ngưỡng an toàn'");

// 5. Modify SensorCard rendering (Sparkline logic)
appContent = appContent.replace(
    /const Spacer\(\),\n\s*SizedBox\(\n\s*height: 42,\n\s*child: SparklineChart\(data: sensor\.history, color: sensor\.color\),\n\s*\),/,
    `const Spacer(),
            if (sensor.name == 'Mực nước')
              Container(
                height: 42,
                alignment: Alignment.center,
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 8,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: FractionallySizedBox(
                          alignment: Alignment.centerLeft,
                          widthFactor: sensor.value == 1.0 ? 1.0 : 0.15,
                          child: Container(
                            decoration: BoxDecoration(
                              color: sensor.value == 1.0 ? const Color(0xFF00A896) : const Color(0xFFFF6B6B),
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              )
            else
              SizedBox(
                height: 42,
                child: SparklineChart(data: sensor.history, color: sensor.color),
              ),`
);

// 6. Modify SensorCard rendering (Value Text)
appContent = appContent.replace(
    /RichText\(\n\s*text: TextSpan\(\n\s*children: \[\n\s*TextSpan\(\n\s*text: sensor\.value\.toStringAsFixed\(2\),\n\s*style: GoogleFonts\.inter\([\s\S]*?height: 1\.0,\n\s*\),\n\s*\),\n\s*if \(sensor\.unit\.isNotEmpty\)[\s\S]*?\),\n\s*\]\,\n\s*\),\n\s*\)/,
    `RichText(
              text: TextSpan(
                children: [
                  if (sensor.name == 'Mực nước')
                    TextSpan(
                      text: sensor.value == 1.0 ? 'Ổn định' : 'Cạn nước',
                      style: GoogleFonts.inter(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: sensor.value == 1.0 ? const Color(0xFF00A896) : const Color(0xFFFF6B6B),
                        height: 1.0,
                      ),
                    )
                  else
                    TextSpan(
                      text: sensor.value.toStringAsFixed(2),
                      style: GoogleFonts.inter(
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        color: sensor.color,
                        height: 1.0,
                      ),
                    ),
                  if (sensor.unit.isNotEmpty && sensor.name != 'Mực nước')
                    TextSpan(
                      text: ' \${sensor.unit}',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: sensor.color.withOpacity(0.6),
                      ),
                    ),
                ],
              ),
            )`
);

// 7. Modify SensorDetailCard (Sparkline logic)
appContent = appContent.replace(
    /const SizedBox\(height: 18\),\n\s*SizedBox\(\n\s*height: 80,\n\s*child: SparklineChart\(data: sensor\.history, color: sensor\.color\),\n\s*\),\n\s*const SizedBox\(height: 12\),\n\s*Row\(\n\s*children: \[\n\s*_statChip\([\s\S]*?\]\,\n\s*\),/,
    `const SizedBox(height: 18),
          if (sensor.name == 'Mực nước')
            Container(
              height: 120,
              alignment: Alignment.center,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    sensor.value == 1.0 ? Icons.check_circle_outline : Icons.warning_amber_rounded,
                    size: 48,
                    color: sensor.value == 1.0 ? const Color(0xFF00A896) : const Color(0xFFFF6B6B),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    sensor.value == 1.0 ? 'Mực nước đang ở mức ổn định' : 'Cảnh báo: Bể đang cạn nước!',
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: sensor.value == 1.0 ? const Color(0xFF00A896) : const Color(0xFFFF6B6B),
                    ),
                  ),
                ],
              ),
            )
          else
            Column(
              children: [
                SizedBox(
                  height: 80,
                  child: SparklineChart(data: sensor.history, color: sensor.color),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _statChip('Min', sensor.history.reduce(min).toStringAsFixed(2), sensor.color),
                    const SizedBox(width: 10),
                    _statChip('Max', sensor.history.reduce(max).toStringAsFixed(2), sensor.color),
                    const SizedBox(width: 10),
                    _statChip('Avg', (sensor.history.reduce((a, b) => a + b) / sensor.history.length).toStringAsFixed(2), sensor.color),
                  ],
                ),
              ],
            ),`
);

// 8. Modify SensorDetailCard value text top right
appContent = appContent.replace(
    /Text\(\n\s*'\$\{sensor\.value\.toStringAsFixed\(2\)\}\$\{sensor\.unit\.isNotEmpty \? ' \$\{sensor\.unit\}' : ''\}',\n\s*style: GoogleFonts\.inter\(\n\s*fontSize: 20,\n\s*fontWeight: FontWeight\.w700,\n\s*color: sensor\.color,\n\s*\),\n\s*\),/,
    `Text(
                    sensor.name == 'Mực nước'
                        ? (sensor.value == 1.0 ? 'Bình thường' : 'Cạn')
                        : '\${sensor.value.toStringAsFixed(2)}\${sensor.unit.isNotEmpty ? ' \${sensor.unit}' : ''}',
                    style: GoogleFonts.inter(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: sensor.name == 'Mực nước'
                          ? (sensor.value == 1.0 ? const Color(0xFF00A896) : const Color(0xFFFF6B6B))
                          : sensor.color,
                    ),
                  ),`
);

fs.writeFileSync(path_app, appContent, 'utf-8');

console.log("Success!");
