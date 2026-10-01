import { useEffect, useState } from 'react'
import { Activity, ArrowRight, Bell, Check, CheckCircle, Clock3, Droplets, Fish, Thermometer, TrendingUp, Zap } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getSpeciesThresholds } from './speciesThresholds'
import type { SpeciesRanges } from './speciesThresholds'
import './CustomerOverview.css'

type SensorKey = 'ph' | 'temp' | 'tds' | 'waterLevel'
type Reading = { time: string; value: number }
type SensorData = Record<SensorKey, Reading[]>

const metrics = [
  { key: 'ph', label: 'pH', unit: '', icon: Activity, color: '#0aa795', good: [6.5, 7.5], warn: [6, 8], range: '6.0 – 8.0' },
  { key: 'temp', label: 'Nhiệt độ', unit: '°C', icon: Thermometer, color: '#fb8750', good: [24, 28], warn: [22, 30], range: '22 – 30°C' },
  { key: 'tds', label: 'TDS', unit: ' ppm', icon: Zap, color: '#b46bf0', good: [150, 300], warn: [100, 400], range: '100 – 400 ppm' },
  { key: 'waterLevel', label: 'Mực nước', unit: '', icon: Droplets, color: '#4c9ff4', good: [1, 1], warn: [1, 1], range: 'Trạng thái hiện tại' },
] as const

function StatusShield({ level }: { level: 'safe' | 'warning' | 'danger' | 'waiting' }) {
  if (level !== 'waiting') {
    return <img className="overview-shield-image" src={`/images/status-shield-${level}.png`} alt={level === 'safe' ? 'Khiên xanh an toàn' : level === 'warning' ? 'Khiên vàng rạn nứt' : 'Khiên đỏ bị vỡ'} />
  }
  return <svg viewBox="0 0 80 88" width="64" height="70" role="img" aria-label="Khiên chờ dữ liệu"><path d="M40 4 70 17v25c0 20-12 32-30 41C22 74 10 62 10 42V17L40 4Z" fill="#97a9b8" stroke="rgba(255,255,255,.55)" strokeWidth="2" /><path d="M40 28v20m0 11v1" stroke="white" strokeWidth="6" strokeLinecap="round" /></svg>
}

interface Props {
  pondName?: string
  userName?: string
  species?: SpeciesRanges
  sensorData: SensorData
  hourlySensorData: SensorData
  alertsCount: number
  onOpenSensor: (key: SensorKey) => void
  onOpenAlerts: () => void
}

export default function CustomerOverview({ pondName, userName, species, sensorData, hourlySensorData, alertsCount, onOpenSensor, onOpenAlerts }: Props) {
  const [chartKey, setChartKey] = useState<SensorKey>('ph')
  const [bannerSlide, setBannerSlide] = useState<{ current: number; previous: number | null }>({ current: 0, previous: null })
  useEffect(() => {
    const timer = window.setInterval(() => setBannerSlide(({ current }) => ({ previous: current, current: (current + 1) % 9 })), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  const speciesThresholds = getSpeciesThresholds(species)
  const resolvedMetrics = metrics.map(metric => {
    if (metric.key === 'waterLevel') return metric
    const limits = speciesThresholds[metric.key]
    return { ...metric, good: limits.good, warn: limits.warn, range: `${limits.good[0]} – ${limits.good[1]}${metric.unit}` }
  })
  const present = resolvedMetrics.filter(metric => sensorData[metric.key].length > 0)
  const safe = present.filter(metric => {
    const value = sensorData[metric.key].at(-1)!.value
    return value >= metric.good[0] && value <= metric.good[1]
  }).length
  const allSafe = present.length === 4 && safe === 4 && alertsCount === 0
  const danger = resolvedMetrics.some(metric => {
    const value = sensorData[metric.key].at(-1)?.value
    return value !== undefined && (value < metric.warn[0] || value > metric.warn[1])
  })
  const shieldLevel = present.length === 0 ? 'waiting' : danger ? 'danger' : allSafe ? 'safe' : 'warning'
  const chartMetric = resolvedMetrics.find(metric => metric.key === chartKey)!
  const chartData = hourlySensorData[chartKey]

  return <section className="customer-overview">
    <div className="overview-hero">
      <div className="overview-hero-copy">
        <div className={`overview-hero-icon ${shieldLevel}`}><StatusShield level={shieldLevel} /></div>
        <div>
          <span className="overview-eyebrow">XIN CHÀO, {(userName?.trim() || 'BẠN').toLocaleUpperCase('vi-VN')}</span>
          <h2>{present.length === 0 ? 'Đang chờ dữ liệu cảm biến' : danger ? 'Hồ cá đang nguy hiểm' : allSafe ? 'Hồ cá đang ổn định' : 'Hồ cá cần theo dõi'}</h2>
          <p>{safe}/{4} chỉ số trong ngưỡng tốt{alertsCount > 0 ? ` · ${alertsCount} cảnh báo` : ''}</p>
        </div>
      </div>
      <div className="overview-hero-checks">
        {resolvedMetrics.map(metric => {
          const last = sensorData[metric.key].at(-1)?.value
          const good = last !== undefined && last >= metric.good[0] && last <= metric.good[1]
          const copy = metric.key === 'ph' ? 'pH trong ngưỡng an toàn' : metric.key === 'temp' ? 'Nhiệt độ phù hợp' : metric.key === 'tds' ? 'TDS đạt mức tốt' : 'Mực nước ổn định'
          return <div key={metric.key}><span className={good ? 'overview-check good' : 'overview-check pending'}>{good ? <Check size={12} /> : '·'}</span>{last === undefined ? `${metric.label}: Chờ dữ liệu` : good ? copy : `${metric.label}: Cần theo dõi`}</div>
        })}
      </div>
      <div className="overview-hero-picture" aria-hidden="true">
        {bannerSlide.previous !== null && <div className="overview-hero-slide" style={{ backgroundImage: `url('/images/pond-fish${bannerSlide.previous + 1}.jpg')` }} />}
        <div className="overview-hero-slide overview-hero-slide-current" key={bannerSlide.current} style={{ backgroundImage: `url('/images/pond-fish${bannerSlide.current + 1}.jpg')` }} />
      </div>
    </div>

    <div className="overview-metrics">
      {resolvedMetrics.map(metric => {
        const readings = sensorData[metric.key]
        const value = readings.at(-1)?.value
        const previous = readings.at(-2)?.value
        const delta = value !== undefined && previous !== undefined ? value - previous : null
        const good = value !== undefined && value >= metric.good[0] && value <= metric.good[1]
        const color = value === undefined ? '#7a8da2' : good ? metric.color : '#e18b44'
        return <button className="overview-metric" key={metric.key} onClick={() => onOpenSensor(metric.key)} style={{ '--metric-color': color } as React.CSSProperties}>
          <div className="overview-metric-top"><span className="overview-metric-icon"><metric.icon size={19} /></span><div className="overview-metric-title"><span>{metric.label}</span><strong>{value === undefined ? 'CHỜ DỮ LIỆU' : good ? metric.key === 'waterLevel' ? 'ỔN ĐỊNH' : 'TỐT' : 'CẦN THEO DÕI'}</strong></div>{delta !== null && metric.key !== 'waterLevel' && <span className="overview-delta"><TrendingUp size={13} /> {delta >= 0 ? '+' : ''}{delta.toFixed(2)}</span>}</div>
          {metric.key !== 'waterLevel' && <div className="overview-metric-value">{value === undefined ? '—' : `${value}${metric.unit}`}</div>}
          {metric.key === 'waterLevel' ? <div className="overview-water-display"><div className="overview-water-wave" aria-hidden="true"><svg viewBox="0 0 400 80" preserveAspectRatio="none"><path d="M0 17 Q25 2 50 17 T100 17 T150 17 T200 17 T250 17 T300 17 T350 17 T400 17 V80 H0Z" /></svg><svg viewBox="0 0 400 80" preserveAspectRatio="none"><path d="M0 20 Q25 5 50 20 T100 20 T150 20 T200 20 T250 20 T300 20 T350 20 T400 20 V80 H0Z" /></svg></div><div className="overview-water-state"><CheckCircle size={19} /><strong>{value === undefined ? 'Chờ dữ liệu' : value === 1 ? 'Ổn định' : 'Cạn nước'}</strong><small>{value === undefined ? 'Chưa có dữ liệu mực nước' : value === 1 ? 'Hoạt động bình thường' : 'Vui lòng kiểm tra mực nước'}</small></div></div> : readings.length > 1 ? <div className="overview-spark"><ResponsiveContainer width="100%" height="100%"><AreaChart data={readings} margin={{ top: 5, right: 3, bottom: 0, left: -9 }}><defs><linearGradient id={`overview-spark-${metric.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={metric.color} stopOpacity={0.28} /><stop offset="100%" stopColor={metric.color} stopOpacity={0} /></linearGradient></defs><XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 9 }} minTickGap={20} interval="preserveStartEnd" /><YAxis domain={['dataMin', 'dataMax']} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 9 }} tickCount={2} width={38} tickFormatter={tick => Number(tick).toFixed(metric.key === 'tds' ? 0 : 2)} /><Area type="monotone" dataKey="value" stroke={metric.color} strokeWidth={2} fill={`url(#overview-spark-${metric.key})`} fillOpacity={1} isAnimationActive={false} /></AreaChart></ResponsiveContainer></div> : <div className="overview-spark overview-spark-empty">Chưa đủ dữ liệu xu hướng</div>}
          {metric.key !== 'waterLevel' && <div className="overview-threshold-row"><div className="overview-threshold-track" role="meter" aria-label={`${metric.label}: ${value === undefined ? 'chưa có dữ liệu' : `${value}${metric.unit}`}, ngưỡng ${metric.range}`} aria-valuemin={metric.good[0]} aria-valuemax={metric.good[1]} aria-valuenow={value === undefined ? undefined : Math.max(metric.good[0], Math.min(metric.good[1], value))}><span style={{ width: `${value === undefined ? 0 : Math.max(0, Math.min(100, ((value - metric.good[0]) / (metric.good[1] - metric.good[0])) * 100))}%` }} /></div><span>{metric.range}</span></div>}
        </button>
      })}
    </div>

    <div className="overview-lower">
      <div className="overview-panel overview-trend">
        <div className="overview-panel-head"><h3><Activity size={19} /> Xu hướng chất lượng nước <small>(12 giờ qua)</small></h3><div className="overview-tabs">{resolvedMetrics.map(metric => <button key={metric.key} className={chartKey === metric.key ? 'active' : ''} onClick={() => setChartKey(metric.key)}>{metric.label}</button>)}</div></div>
        <div className="overview-chart">
          {chartData.length === 0 ? <div className="overview-chart-empty">Chưa có dữ liệu trong 12 giờ qua</div> : chartKey === 'waterLevel' ? <div className="overview-level-bars">{chartData.map((point, index) => <div key={`${point.time}-${index}`} title={`${point.time}: ${point.value === 1 ? 'Ổn định' : 'Cạn nước'}`}><span className={point.value === 1 ? 'good' : 'alert'} />{point.time}</div>)}</div> : <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 8, bottom: 0, left: -20 }}><defs><linearGradient id={`overview-trend-${chartKey}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={chartMetric.color} stopOpacity={0.24} /><stop offset="100%" stopColor={chartMetric.color} stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--overview-grid)" vertical={false} /><XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} minTickGap={28} /><YAxis domain={['auto', 'auto']} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} /><Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, color: 'var(--text-primary)' }} formatter={value => [`${value ?? '—'}${chartMetric.unit}`, chartMetric.label]} /><Area type="monotone" dataKey="value" stroke={chartMetric.color} strokeWidth={2.5} fill={`url(#overview-trend-${chartKey})`} fillOpacity={1} isAnimationActive={false} /></AreaChart></ResponsiveContainer>}
        </div>
        {chartData.length > 0 && chartKey !== 'waterLevel' && <div className="overview-chart-stats">{[['Thấp nhất', Math.min(...chartData.map(d => d.value))], ['Cao nhất', Math.max(...chartData.map(d => d.value))], ['Trung bình', chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{Number(value).toFixed(chartKey === 'tds' ? 0 : 2)}{chartMetric.unit}</strong></div>)}</div>}
      </div>
      <div className="overview-side">
        <div className="overview-panel overview-status"><div className="overview-panel-head"><h3><Fish size={19} /> Trạng thái hồ cá</h3><span className="overview-preview">Giao diện xem trước</span></div><div className="overview-status-body"><div className="overview-pond-image" /><div className="overview-status-fields"><div><span>Trạng thái tổng thể</span><strong className={allSafe ? 'positive' : ''}>{present.length === 0 ? 'Chờ dữ liệu' : allSafe ? 'Ổn định' : 'Cần theo dõi'}</strong></div><div><span>Bể cá</span><strong>{pondName || 'Chưa chọn bể'}</strong></div><div><span>Chỉ số an toàn</span><strong>{safe}/4</strong></div><div><span>Cảnh báo hiện tại</span><strong>{alertsCount}</strong></div></div></div></div>
        <div className="overview-panel overview-activity"><div className="overview-panel-head"><h3><Clock3 size={19} /> Hoạt động gần đây</h3><button onClick={onOpenAlerts}>Xem cảnh báo <ArrowRight size={14} /></button></div><div className="overview-activity-list"><div><span className="overview-activity-icon"><Bell size={16} /></span><p><strong>{alertsCount ? `${alertsCount} cảnh báo cần xem` : 'Không có cảnh báo hiện tại'}</strong><small>{alertsCount ? 'Mở mục Cảnh báo để xem chi tiết' : 'Dựa trên trạng thái cảnh báo đang tải'}</small></p></div><div><span className="overview-activity-icon"><CheckCircle size={16} /></span><p><strong>Dữ liệu cảm biến</strong><small>{present.length}/4 chỉ số đã có dữ liệu</small></p></div></div><p className="overview-preview-note">Nhật ký hoạt động chi tiết sẽ được kết nối sau.</p></div>
      </div>
    </div>
  </section>
}
