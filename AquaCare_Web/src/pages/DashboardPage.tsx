import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Droplets, Thermometer, Zap, Fish, Bell, AlertCircle,
  LogOut, Home, Activity, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  Pencil, Trash2, Plus, ChevronDown, X, Check, Sliders, Lightbulb, Power, ArrowLeft
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, Sector } from 'recharts'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aquacare-p78r.onrender.com'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const F = "'Inter', sans-serif"

// ── Kiểu dữ liệu ────────────────────────────────────────────
interface SensorReading { time: string; value: number }
interface SensorData {
  ph: SensorReading[]
  tds: SensorReading[]
  temp: SensorReading[]
  waterLevel: SensorReading[]
}
interface AlertItem {
  key: string; label: string; val: number; unit: string;
  level: 'warn' | 'danger'; msg: string;
}
interface Pond {
  id: number
  name: string
  volume?: number
  species_id?: number
  species_name?: string
  mac_address?: string
}
interface FishSpecies {
  id: number
  species_name: string
}

// ── Sinh dữ liệu giả ─────────────────────────────────────────
const emptySensor = (): SensorData => ({ ph: [], tds: [], temp: [], waterLevel: [] })

// ── Sparkline ─────────────────────────────────────────────
function Sparkline({ data, color, height = 60 }: { data: any[]; color: string; height?: number }) {
  if (data.length < 2) return null;
  return (
    <div style={{ height, width: '100%', marginTop: 10 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`color-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            fontSize={9}
            tick={{ fill: 'rgba(255,255,255,0.4)' }}
            axisLine={false}
            tickLine={false}
            minTickGap={20}
          />
          <YAxis
            domain={['dataMin', 'dataMax']}
            fontSize={9}
            tick={{ fill: 'rgba(255,255,255,0.4)' }}
            axisLine={false}
            tickLine={false}
            width={35}
          />
          <Tooltip
            contentStyle={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11, color: '#fff' }}
            itemStyle={{ color: color, fontWeight: 600 }}
            labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}
          />
          <Area type="monotone" dataKey="value" stroke={color} fillOpacity={1} fill={`url(#color-${color.replace('#', '')})`} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Bar Chart ─────────────────────────────────────────────────
function BarChart({ data, color, labels, height = 120 }: { data: number[]; color: string; labels: string[]; height?: number }) {
  const max = Math.max(...data) || 1
  const barW = 20
  const gap = 8
  const total = data.length * (barW + gap)
  return (
    <svg width="100%" viewBox={`0 0 ${total} ${height + 20}`} style={{ overflow: 'visible' }}>
      {data.map((v, i) => {
        const bh = (v / max) * height
        const x = i * (barW + gap)
        return (
          <g key={i}>
            <rect x={x} y={height - bh} width={barW} height={bh} rx={4}
              fill={color} opacity={i === data.length - 1 ? 1 : 0.45} />
            <text x={x + barW / 2} y={height + 14} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily={F}>
              {labels[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Cấu hình cảm biến ─────────────────────────────────────────
const SENSOR_CFG = [
  { key: 'ph' as const, label: 'pH', unit: '', icon: Activity, color: '#00A896', good: [6.5, 7.5], warn: [6.0, 8.0] },
  { key: 'temp' as const, label: 'Nhiệt độ', unit: '°C', icon: Thermometer, color: '#FF8C42', good: [24, 28], warn: [22, 30] },
  { key: 'tds' as const, label: 'TDS', unit: 'ppm', icon: Zap, color: '#C77DFF', good: [150, 300], warn: [100, 400] },
  { key: 'waterLevel' as const, label: 'Mực nước', unit: '', icon: Droplets, color: '#4DA6FF', good: [1, 1], warn: [0, 1] },
]

function statusColor(val: number, good: number[], warn: number[], key?: string) {
  if (key === 'waterLevel') return val === 1 ? '#00A896' : '#FF6B6B'
  if (val >= good[0] && val <= good[1]) return '#00A896'
  if (val >= warn[0] && val <= warn[1]) return '#FFB347'
  return '#FF6B6B'
}
function statusLabel(val: number, good: number[], warn: number[], key?: string) {
  if (key === 'waterLevel') return val === 1 ? 'Ổn định' : 'Cạn nước'
  if (val >= good[0] && val <= good[1]) return 'Tốt'
  if (val >= warn[0] && val <= warn[1]) return 'Cảnh báo'
  return 'Nguy hiểm'
}

// ── Custom Dialog ────────────────────────────────────────────
function Dialog({
  title, message, error, confirmText = 'Xác nhận', cancelText = 'Hủy',
  confirmColor = '#00A896', onConfirm, onCancel, children
}: {
  title: React.ReactNode | string; message?: string; error?: string; confirmText?: string; cancelText?: string
  confirmColor?: string; onConfirm: () => void; onCancel: () => void; children?: React.ReactNode
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onCancel}>
      <div style={{
        background: 'linear-gradient(135deg, #0d1a2e, #112240)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 18, padding: '28px 32px', width: 360, maxWidth: '90vw',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        animation: 'dialogIn 200ms cubic-bezier(0.34,1.56,0.64,1)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>{title}</h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 4, borderRadius: 6 }}>
            <X size={16} />
          </button>
        </div>
        {message && (
          <p style={{ margin: '0 0 20px', fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{message}</p>
        )}
        {children}
        {error && (
          <p style={{ margin: '16px 0 0', fontSize: 13, color: '#FF6B6B', fontWeight: 500, textAlign: 'center' }}>{error}</p>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: error ? 16 : 24 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', fontFamily: F,
            transition: 'all 160ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
          >{cancelText}</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
            background: confirmColor, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F,
            transition: 'all 160ms', boxShadow: `0 4px 16px ${confirmColor}40`,
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
          >{confirmText}</button>
        </div>
      </div>
    </div>
  )
}

// ── Pond Dropdown ────────────────────────────────────────────
function PondDropdown({
  ponds, activeDevice, onSelect, onEdit, onDelete, onAdd
}: {
  ponds: Pond[]; activeDevice: number | null
  onSelect: (id: number) => void
  onEdit: (pond: Pond) => void
  onDelete: (pond: Pond) => void
  onAdd: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const activePond = ponds.find(p => p.id === activeDevice)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 14px', borderRadius: 10, cursor: 'pointer',
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
        color: '#00A896', fontSize: 12, fontWeight: 600, fontFamily: F,
        transition: 'all 180ms', minWidth: 180,
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
      >
        <Fish size={13} />
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activePond?.name ?? 'Chọn bể cá'}
        </span>
        <ChevronDown size={13} style={{ transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 100,
          background: 'linear-gradient(135deg, #0d1a2e, #112240)',
          border: '1px solid rgba(255,255,255,0.10)', borderRadius: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)', minWidth: 240,
          animation: 'fadeDown 160ms ease',
          overflow: 'hidden',
        }}>
          {/* Pond list */}
          <div style={{ padding: '8px 8px 4px' }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px 8px' }}>
              Danh sách bể cá
            </div>
            {ponds.map(pond => (
              <div key={pond.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 10px', borderRadius: 9,
                background: pond.id === activeDevice ? 'rgba(0,168,150,0.12)' : 'transparent',
                transition: 'background 150ms',
              }}
                onMouseEnter={e => { if (pond.id !== activeDevice) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { if (pond.id !== activeDevice) e.currentTarget.style.background = 'transparent' }}
              >
                {/* Select area */}
                <button onClick={() => { onSelect(pond.id); setOpen(false) }} style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: 'none', cursor: 'pointer', color: pond.id === activeDevice ? '#00A896' : 'rgba(255,255,255,0.65)',
                  fontSize: 12, fontWeight: pond.id === activeDevice ? 600 : 400, fontFamily: F, textAlign: 'left', padding: 0,
                }}>
                  {pond.id === activeDevice
                    ? <Check size={12} style={{ color: '#00A896', flexShrink: 0 }} />
                    : <div style={{ width: 12, flexShrink: 0 }} />
                  }
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pond.name}</span>
                </button>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  <button onClick={e => { e.stopPropagation(); onEdit(pond); setOpen(false) }} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 6,
                    color: 'rgba(255,255,255,0.3)', transition: 'all 140ms',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#4DA6FF' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
                    title="Cấu hình"
                  ><Pencil size={11} /></button>
                  <button onClick={e => { e.stopPropagation(); onDelete(pond); setOpen(false) }} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 6,
                    color: 'rgba(255,255,255,0.3)', transition: 'all 140ms',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.12)'; e.currentTarget.style.color = '#FF6B6B' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
                    title="Xóa"
                  ><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

          {/* Add new */}
          <div style={{ padding: '4px 8px 8px' }}>
            <button onClick={() => { onAdd(); setOpen(false) }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px', borderRadius: 9, border: '1px dashed rgba(0,229,160,0.25)',
              background: 'rgba(0,229,160,0.04)', color: '#00A896', fontSize: 12, fontWeight: 500,
              cursor: 'pointer', fontFamily: F, transition: 'all 160ms',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,229,160,0.10)'; e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,229,160,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,229,160,0.25)' }}
            >
              <Plus size={13} /> Thêm bể mới
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Component chính ───────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()
  const [sensorData, setSensorData] = useState<SensorData>(emptySensor())
  const [selectedSensor, setSelectedSensor] = useState<keyof SensorData>('ph')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [alertHistory, setAlertHistory] = useState<any[]>([])
  const [alertStats, setAlertStats] = useState<{ name: string, value: number }[]>([])
  const [historyCursors, setHistoryCursors] = useState<number[]>([0])
  const [currentHistoryPage, setCurrentHistoryPage] = useState(0)
  const [historyHasNext, setHistoryHasNext] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const currentHistoryPageRef = useRef(0)

  const [activePieIndex, setActivePieIndex] = useState(0)
  const onPieEnter = (_: any, index: number) => {
    setActivePieIndex(index)
  }

  useEffect(() => {
    currentHistoryPageRef.current = currentHistoryPage
  }, [currentHistoryPage])

  const [activeTab, setActiveTab] = useState<'overview' | 'control' | 'sensors' | 'alerts'>('overview')
  const [pumpState, setPumpState] = useState(false)
  const [lightState, setLightState] = useState(false)
  const [pumpOnTime, setPumpOnTime] = useState('')
  const [pumpOffTime, setPumpOffTime] = useState('')
  const [lightOnTime, setLightOnTime] = useState('')
  const [lightOffTime, setLightOffTime] = useState('')
  const [ponds, setPonds] = useState<Pond[]>([])
  const [fishSpecies, setFishSpecies] = useState<FishSpecies[]>([])
  const [activeDevice, setActiveDevice] = useState<number | null>(null)
  const [tick, setTick] = useState(0)
  const [loading, setLoading] = useState(false)

  // Dialog states
  const [addDialog, setAddDialog] = useState(false)
  const [addName, setAddName] = useState('')
  const [addVolume, setAddVolume] = useState<number | string>('')
  const [addSpeciesId, setAddSpeciesId] = useState<number>(0)
  const [addMacAddress, setAddMacAddress] = useState('')
  const [editDialog, setEditDialog] = useState<Pond | null>(null)
  const [editName, setEditName] = useState('')
  const [editVolume, setEditVolume] = useState<number | string>('')
  const [editSpeciesId, setEditSpeciesId] = useState<number>(0)
  const [editMacAddress, setEditMacAddress] = useState('')
  const [deleteDialog, setDeleteDialog] = useState<Pond | null>(null)
  const [dialogError, setDialogError] = useState('')

  // Bảo vệ route
  useEffect(() => {
    if (!localStorage.getItem('cs_auth')) navigate('/login')
  }, [navigate])

  // ── Load Initial Data ─────────────────────────
  useEffect(() => {
    supabase.from('fish_species').select('*').then(({ data }) => {
      if (data) setFishSpecies(data as FishSpecies[])
    })

    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}')
    if (userInfo?.id) {
      supabase.from('tanks').select('*, fish_species(*), devices(mac_address)').eq('user_id', userInfo.id).then(({ data }) => {
        if (data) {
          const mapped = data.map((t: any) => ({
            id: t.id,
            name: t.tank_name,
            volume: t.water_volume_liter,
            species_id: t.species_id,
            species_name: t.fish_species?.species_name,
            mac_address: t.devices?.[0]?.mac_address || ''
          }))
          setPonds(mapped)
          if (mapped.length > 0) setActiveDevice(mapped[0].id)
        }
      })
    }
  }, [])

  // ── Fetch Sensor Data ─────────────────────────
  const fetchSensorData = async () => {
    if (!activeDevice) return
    // setLoading(true)

    const { data: devices } = await supabase.from('devices').select('id').eq('tank_id', activeDevice)
    if (!devices || devices.length === 0) {
      setSensorData(emptySensor())
      setAlerts([])
      // setLoading(false)
      return
    }

    const { data: telemetries } = await supabase.from('telemetry_logs')
      .select('*')
      .eq('device_id', devices[0].id)
      .order('recorded_at', { ascending: false })
      .limit(24)

    if (telemetries) {
      const rev = telemetries.reverse()
      const mapData = (parseFn: (d: any) => number) => rev.map(d => ({
        time: new Date(d.recorded_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        value: parseFn(d)
      }))

      setSensorData({
        ph: mapData(d => Number(d.ph) || 0),
        tds: mapData(d => Number(d.tds) || 0),
        temp: mapData(d => Number(d.temp) || 0),
        waterLevel: mapData(d => d.water_level_ok ? 1 : 0),
      })
    }
    setTick(t => t + 1)
    setLoading(false)
  }

  const fetchAlertHistoryPage = async (pageIndex: number, deviceId: number, cursors: number[]) => {
    setHistoryLoading(true);
    const cursor = cursors[pageIndex];
    let query = supabase.from('alerts_history')
      .select('*')
      .eq('tank_id', deviceId)
      .order('id', { ascending: false })
      .limit(11);

    if (cursor > 0) {
      query = query.lt('id', cursor);
    }

    const { data } = await query;
    if (data) {
      const hasNext = data.length > 10;
      const items = data.slice(0, 10);
      setAlertHistory(items);
      setHistoryHasNext(hasNext);

      if (hasNext && cursors.length === pageIndex + 1) {
        setHistoryCursors(prev => [...prev, items[items.length - 1].id]);
      }
      setCurrentHistoryPage(pageIndex);
    }
    setHistoryLoading(false);
  }

  // Đổi thiết bị → làm mới data & Thiết lập Realtime
  useEffect(() => {
    if (!activeDevice) return

    let channel: any;

    const setupRealtime = async () => {
      // 1. Load 24 điểm dữ liệu lịch sử ban đầu
      await fetchSensorData();

      // 2. Lấy device_id tương ứng với bể cá
      const { data: devices } = await supabase.from('devices').select('id, relay_pump_state, relay_light_state, pump_on_time, pump_off_time, light_on_time, light_off_time').eq('tank_id', activeDevice);
      if (!devices || devices.length === 0) return;
      const deviceId = devices[0].id;
      setPumpState(Boolean(devices[0].relay_pump_state));
      setLightState(Boolean(devices[0].relay_light_state));
      setPumpOnTime(devices[0].pump_on_time || '');
      setPumpOffTime(devices[0].pump_off_time || '');
      setLightOnTime(devices[0].light_on_time || '');
      setLightOffTime(devices[0].light_off_time || '');

      // Lấy tất cả loại cảnh báo để thống kê
      const { data: statsData } = await supabase.from('alerts_history').select('alert_type').eq('tank_id', activeDevice)
      if (statsData) {
        const counts = statsData.reduce((acc, h) => {
          acc[h.alert_type] = (acc[h.alert_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setAlertStats(Object.entries(counts).map(([name, value]) => ({ name, value })));
      }

      setHistoryCursors([0])
      setCurrentHistoryPage(0)
      await fetchAlertHistoryPage(0, activeDevice, [0])

      // 3. Đăng ký Realtime
      channel = supabase.channel(`telemetry_logs_device_${deviceId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'telemetry_logs',
            filter: `device_id=eq.${deviceId}`
          },
          (payload) => {
            const newData = payload.new as any;
            const timeStr = new Date(newData.recorded_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

            setSensorData(prev => {
              const appendData = (arr: SensorReading[], val: number) => [...arr, { time: timeStr, value: val }].slice(-24);
              return {
                ph: appendData(prev.ph, Number(newData.ph) || 0),
                tds: appendData(prev.tds, Number(newData.tds) || 0),
                temp: appendData(prev.temp, Number(newData.temp) || 0),
                waterLevel: appendData(prev.waterLevel, newData.water_level_ok ? 1 : 0),
              };
            });
            setTick(t => t + 1); // Trigger check cảnh báo
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'alerts_history',
            filter: `tank_id=eq.${activeDevice}`
          },
          (payload) => {
            const newAlert = payload.new as any;
            setAlertStats(prev => {
              const existing = prev.find(p => p.name === newAlert.alert_type);
              if (existing) {
                return prev.map(p => p.name === newAlert.alert_type ? { ...p, value: p.value + 1 } : p);
              } else {
                return [...prev, { name: newAlert.alert_type, value: 1 }];
              }
            });
            if (currentHistoryPageRef.current === 0) {
              setAlertHistory(prev => {
                const updated = [newAlert, ...prev];
                if (updated.length > 10) setHistoryHasNext(true);
                return updated.slice(0, 10);
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'devices',
            filter: `id=eq.${deviceId}`
          },
          (payload) => {
            const newData = payload.new as any;
            // Cập nhật lại các State của nút bấm và cấu hình giờ
            setPumpState(Boolean(newData.relay_pump_state));
            setLightState(Boolean(newData.relay_light_state));
            setPumpOnTime(newData.pump_on_time || '');
            setPumpOffTime(newData.pump_off_time || '');
            setLightOnTime(newData.light_on_time || '');
            setLightOffTime(newData.light_off_time || '');
          }
        )
        .subscribe();
    }

    setupRealtime();

    // 4. Dọn dẹp (Cleanup) khi đổi bể khác hoặc unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    }
  }, [activeDevice])

  // Tạo cảnh báo
  useEffect(() => {
    if (!sensorData.ph.length) return
    const newAlerts: AlertItem[] = []
    SENSOR_CFG.forEach(cfg => {
      const latest = sensorData[cfg.key].at(-1)?.value ?? 0
      if (cfg.key === 'waterLevel') {
        if (latest === 0) newAlerts.push({ key: cfg.key, label: cfg.label, val: latest, unit: cfg.unit, msg: `Mực nước bể cá đang ở mức thấp, vui lòng châm thêm nước!`, level: 'danger' })
      } else {
        if (latest < cfg.warn[0] || latest > cfg.warn[1]) {
          newAlerts.push({ key: cfg.key, label: cfg.label, val: latest, unit: cfg.unit, msg: `${cfg.label} = ${latest}${cfg.unit} — ngoài ngưỡng cho phép!`, level: 'danger' })
        } else if (latest < cfg.good[0] || latest > cfg.good[1]) {
          newAlerts.push({ key: cfg.key, label: cfg.label, val: latest, unit: cfg.unit, msg: `${cfg.label} = ${latest}${cfg.unit} — chạm mức cảnh báo sớm!`, level: 'warn' })
        }
      }
    })
    setAlerts(newAlerts)
  }, [tick])

  const handleLogout = () => {
    localStorage.removeItem('cs_auth')
    navigate('/login')
  }

  // ── CRUD handlers ─────────────────────────────────────────────
  const handleSelectPond = (id: number) => {
    setActiveDevice(id)
  }

  const handleAddConfirm = async () => {
    setDialogError('')
    const name = addName.trim()
    if (!name) return

    const mac = addMacAddress.trim()
    if (mac) {
      const { data: dev } = await supabase.from('devices').select('id, tank_id').eq('mac_address', mac).single()
      if (!dev) return setDialogError('Mã thiết bị không tồn tại trên hệ thống!')
      if (dev.tank_id) return setDialogError('Thiết bị này đã được sử dụng cho bể khác!')
    }

    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}')

    const { data } = await supabase.from('tanks').insert({
      user_id: userInfo.id,
      tank_name: name,
      water_volume_liter: Number(addVolume) || null,
      species_id: addSpeciesId || null
    }).select('*, fish_species(*)')

    if (data && data.length > 0) {
      if (mac) await supabase.from('devices').update({ tank_id: data[0].id }).eq('mac_address', mac)

      const t = data[0]
      const newPond: Pond = {
        id: t.id,
        name: t.tank_name,
        volume: t.water_volume_liter,
        species_id: t.species_id,
        species_name: t.fish_species?.species_name,
        mac_address: mac
      }
      setPonds(prev => [...prev, newPond])
      setActiveDevice(newPond.id)
    }

    setAddName('')
    setAddVolume('')
    setAddSpeciesId(0)
    setAddMacAddress('')
    setAddDialog(false)
  }

  const handleEditConfirm = async () => {
    setDialogError('')
    const name = editName.trim()
    if (!name || !editDialog) return

    const mac = editMacAddress.trim()
    if (mac && mac !== editDialog?.mac_address) {
      const { data: dev } = await supabase.from('devices').select('id, tank_id').eq('mac_address', mac).single()
      if (!dev) return setDialogError('Mã thiết bị không tồn tại trên hệ thống!')
      if (dev.tank_id && dev.tank_id !== editDialog?.id) return setDialogError('Thiết bị này đã thuộc về bể khác!')
    }

    const { data } = await supabase.from('tanks').update({
      tank_name: name,
      water_volume_liter: Number(editVolume) || null,
      species_id: editSpeciesId || null
    }).eq('id', editDialog.id).select('*, fish_species(*)')

    if (data && data.length > 0) {
      if (mac !== editDialog?.mac_address) {
        if (editDialog?.mac_address) await supabase.from('devices').update({ tank_id: null }).eq('mac_address', editDialog.mac_address)
        if (mac) await supabase.from('devices').update({ tank_id: editDialog.id }).eq('mac_address', mac)
      }

      const updatedPond = {
        id: data[0].id,
        name: data[0].tank_name,
        volume: data[0].water_volume_liter,
        species_id: data[0].species_id,
        species_name: data[0].fish_species?.species_name,
        mac_address: mac
      }
      setPonds(prev => prev.map(p => p.id === editDialog.id ? updatedPond : p))
    }
    setEditDialog(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog) return
    await supabase.from('tanks').delete().eq('id', deleteDialog.id)
    const remaining = ponds.filter(p => p.id !== deleteDialog.id)
    setPonds(remaining)
    if (activeDevice === deleteDialog.id) {
      setActiveDevice(remaining[0]?.id ?? null)
    }
    setDeleteDialog(null)
  }

  const latest = Object.fromEntries(
    SENSOR_CFG.map(cfg => [cfg.key, sensorData[cfg.key].at(-1)?.value ?? 0])
  ) as Record<keyof SensorData, number>

  const selectedCfg = SENSOR_CFG.find(c => c.key === selectedSensor)!
  const selectedHistory = sensorData[selectedSensor]

  const hasDanger = alerts.some(a => a.level === 'danger')
  const alertGlobalColor = alerts.length === 0 ? '#00A896' : (hasDanger ? '#FF6B6B' : '#FFB347')
  const alertGlobalBg = alerts.length === 0 ? 'rgba(0,229,160,0.1)' : (hasDanger ? 'rgba(255,107,107,0.12)' : 'rgba(255,179,71,0.12)')

  const activePond = ponds.find(p => p.id === activeDevice)

  const PIE_COLORS = ['#00A896', '#FF8C42', '#C77DFF', '#4DA6FF', '#FF6B6B'];
  const alertDistData = alertStats;

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    return (
      <g>
        <text x={cx} y={cy - 4} dy={0} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={11} fontWeight={600} fontFamily={F} style={{ textTransform: 'uppercase' }} letterSpacing="0.05em">
          {payload.name}
        </text>
        <text x={cx} y={cy + 18} dy={0} textAnchor="middle" fill={fill} fontSize={22} fontWeight={800} fontFamily={F}>
          {value}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ filter: `drop-shadow(0px 8px 16px ${fill}80)` }}
          cornerRadius={4}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 14}
          fill={fill}
          cornerRadius={2}
        />
      </g>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #060e1a 0%, #0a1628 60%, #0d2235 100%)', fontFamily: F, color: '#fff', display: 'flex' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 240 : 64, flexShrink: 0,
        background: 'rgba(10,20,38,0.95)', borderRight: '1px solid rgba(26,45,74,0.5)',
        backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column',
        transition: 'width 280ms cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
          onClick={() => setSidebarOpen(o => !o)}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#1B4F72,#00A896)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,229,160,0.25)' }}>
            <Fish size={18} color="#fff" />
          </div>
          {sidebarOpen && <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>AQUACARE</span>}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { id: 'overview', icon: Home, label: 'Tổng quan' },
            { id: 'sensors', icon: Activity, label: 'Cảm biến' },
            { id: 'control', icon: Sliders, label: 'Điều khiển thiết bị' },
            { id: 'alerts', icon: Bell, label: `Cảnh báo${alerts.length ? ` (${alerts.length})` : ''}` },
          ].map(item => (
            <button key={item.id}
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10,
                border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 12, fontWeight: 500,
                background: activeTab === item.id ? 'rgba(0,229,160,0.12)' : 'transparent',
                color: activeTab === item.id ? '#00A896' : 'rgba(255,255,255,0.45)',
                transition: 'all 180ms', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (activeTab !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (activeTab !== item.id) e.currentTarget.style.background = 'transparent' }}
            >
              <item.icon size={16} style={{ flexShrink: 0 }} />
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sidebarOpen && (
            <div style={{ padding: '8px 12px', marginBottom: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>Phạm Lê Nhật Minh</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>phamlenhatminh1609@gmail.com</div>
            </div>
          )}
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10,
            textDecoration: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 500,
            transition: 'all 180ms', whiteSpace: 'nowrap'
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
          >
            <ArrowLeft size={16} style={{ flexShrink: 0 }} />
            {sidebarOpen && 'Về trang chủ'}
          </Link>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 12, background: 'transparent', color: 'rgba(255,107,107,0.7)', transition: 'all 180ms', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.1)'; e.currentTarget.style.color = '#FF6B6B' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,107,107,0.7)' }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {sidebarOpen && 'Đăng xuất'}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflow: 'hidden', minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* Top bar */}
        <div style={{ padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(26,45,74,0.4)', background: 'rgba(10,20,38,0.7)', backdropFilter: 'blur(8px)', flexShrink: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeTab === 'overview' && <><Home size={20} color="#00A896" /> Tổng quan hệ thống</>}
              {activeTab === 'control' && <><Sliders size={20} color="#00A896" /> Điều khiển thiết bị</>}
              {activeTab === 'sensors' && <><Activity size={20} color="#00A896" /> Biểu đồ cảm biến</>}
              {activeTab === 'alerts' && <><Bell size={20} color="#00A896" /> Cảnh báo & Thông báo</>}
            </h1>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Custom Pond Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Bể cá:</span>
              <PondDropdown
                ponds={ponds}
                activeDevice={activeDevice}
                onSelect={handleSelectPond}
                onEdit={pond => {
                  setEditDialog(pond);
                  setEditName(pond.name);
                  setEditVolume(pond.volume ?? '');
                  setEditSpeciesId(pond.species_id ?? 0);
                  setEditMacAddress(pond.mac_address || '');
                  setDialogError('');
                }}
                onDelete={pond => setDeleteDialog(pond)}
                onAdd={() => { setAddName(''); setAddVolume(''); setAddSpeciesId(0); setAddMacAddress(''); setDialogError(''); setAddDialog(true) }}
              />
            </div>

            {/* Loading indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                <div style={{ width: 12, height: 12, border: '2px solid rgba(0,229,160,0.3)', borderTopColor: '#00A896', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Đang tải...
              </div>
            )}

            {alerts.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: alertGlobalBg, border: `1px solid ${alertGlobalColor}40`, fontSize: 11, color: alertGlobalColor }}>
                <AlertTriangle size={13} /> {alerts.length} cảnh báo
              </div>
            )}
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: loading ? '#FFB347' : '#00A896', boxShadow: `0 0 8px ${loading ? '#FFB347' : '#00A896'}`, animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{loading ? 'Sync...' : 'Live'}</span>
            <Link to="/game" style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', color: '#00A896', textDecoration: 'none', fontSize: 11, fontWeight: 600 }}>🐠 Farm Game</Link>
          </div>
        </div>

        <div className="custom-scrollbar" style={{ padding: '24px 28px', opacity: loading ? 0.5 : 1, transition: 'opacity 300ms', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' }}>

          {/* ═══ TAB: OVERVIEW ═══ */}
          {activeTab === 'overview' && (
            <>
              {/* 4 Sensor Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
                {SENSOR_CFG.map(cfg => {
                  const val = latest[cfg.key]
                  const sc = statusColor(val, cfg.good, cfg.warn, cfg.key)
                  const sl = statusLabel(val, cfg.good, cfg.warn, cfg.key)
                  const histData = sensorData[cfg.key]
                  const hist = histData.map(d => d.value)
                  const prev = hist.at(-2) ?? val
                  const delta = val - prev
                  return (
                    <div key={cfg.key}
                      onClick={() => { setSelectedSensor(cfg.key); setActiveTab('sensors') }}
                      style={{ padding: '20px', borderRadius: 16, background: 'rgba(15,26,48,0.8)', border: `1px solid ${cfg.color}18`, cursor: 'pointer', transition: 'all 220ms', position: 'relative', overflow: 'hidden' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${cfg.color}40`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = `${cfg.color}18`; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${cfg.color}08 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cfg.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <cfg.icon size={16} color={cfg.color} />
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{cfg.label}</div>
                            <div style={{ fontSize: 9, color: sc, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 1 }}>{sl}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: delta >= 0 ? '#00A896' : '#FF6B6B' }}>
                          {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {delta >= 0 ? '+' : ''}{delta.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ fontSize: 32, fontWeight: 700, color: sc, marginBottom: 12, letterSpacing: '-0.02em' }}>
                        {cfg.key === 'waterLevel' ? '' : `${val}${cfg.unit}`}
                      </div>
                      {cfg.key === 'waterLevel' ? (
                        <div style={{ marginTop: 16, height: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <Droplets size={28} color={sc} />
                          <span style={{ fontSize: 16, fontWeight: 600, color: sc, letterSpacing: '0.02em' }}>
                            {val === 1 ? 'Mực nước Ổn định' : 'Cảnh báo Cạn nước'}
                          </span>
                        </div>
                      ) : (
                        <>
                          <Sparkline data={sensorData[cfg.key]} color={cfg.color} height={75} />
                          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, ((val - cfg.warn[0]) / (cfg.warn[1] - cfg.warn[0])) * 100))}%`, background: sc, borderRadius: 2, transition: 'width 600ms ease' }} />
                            </div>
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>{cfg.warn[0]}–{cfg.warn[1]}{cfg.unit}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Bottom charts row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ padding: 20, borderRadius: 16, background: 'rgba(15,26,48,0.8)', border: '1px solid rgba(26,45,74,0.5)' }}>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Hoạt động 12 giờ qua (pH)</h3>
                  <BarChart
                    data={sensorData.ph.slice(-12).map(d => d.value)}
                    color="#00A896"
                    labels={sensorData.ph.slice(-12).map(d => d.time)}
                  />
                </div>
                <div style={{ padding: 20, borderRadius: 16, background: 'rgba(15,26,48,0.8)', border: '1px solid rgba(26,45,74,0.5)' }}>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Trạng thái tổng hợp</h3>
                  {SENSOR_CFG.map(cfg => {
                    const val = latest[cfg.key]
                    const sc = statusColor(val, cfg.good, cfg.warn, cfg.key)
                    const sl = statusLabel(val, cfg.good, cfg.warn, cfg.key)
                    return (
                      <div key={cfg.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <cfg.icon size={13} color={cfg.color} />
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{cfg.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{val}{cfg.unit}</span>
                          <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: `${sc}18`, color: sc, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sl}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* ═══ TAB: CONTROL ═══ */}
          {activeTab === 'control' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>

              {/* Máy bơm nước */}
              <div style={{
                padding: 24, borderRadius: 16, background: 'rgba(15,26,48,0.8)',
                border: `1px solid ${pumpState ? '#00A896' : 'rgba(26,45,74,0.5)'}`,
                transition: 'all 200ms', display: 'flex', flexDirection: 'column', gap: 24
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: pumpState ? 'rgba(0,168,150,0.15)' : 'rgba(255,255,255,0.05)',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      transition: 'all 200ms'
                    }}>
                      <Droplets size={24} color={pumpState ? '#00A896' : 'rgba(255,255,255,0.3)'} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px', color: '#fff' }}>Máy bơm nước</h3>
                      <p style={{ fontSize: 13, margin: 0, color: pumpState ? '#00A896' : 'rgba(255,255,255,0.4)', transition: 'color 200ms' }}>
                        {pumpState ? 'Đang hoạt động' : 'Đang tắt'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const newState = !pumpState;
                      const { data: dev, error } = await supabase.from('devices')
                        .update({ relay_pump_state: newState })
                        .eq('tank_id', activeDevice)
                        .select('id')
                        .single();
                      if (!error && dev) {
                        setPumpState(newState);
                        await supabase.from('relay_logs').insert({
                          device_id: dev.id,
                          relay_name: 'Pump',
                          action: newState ? 'ON' : 'OFF',
                          triggered_by: 'USER'
                        });
                      }
                    }}
                    style={{
                      width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: pumpState ? '#00A896' : 'rgba(255,255,255,0.1)',
                      boxShadow: pumpState ? '0 0 20px rgba(0,168,150,0.4)' : 'none',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      transition: 'all 200ms', flexShrink: 0
                    }}
                  >
                    <Power size={24} color={pumpState ? '#fff' : 'rgba(255,255,255,0.5)'} />
                  </button>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontWeight: 600 }}>Hẹn giờ bật</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      {['07:00', '09:00', '12:00'].map(t => (
                        <button key={t} onClick={() => setPumpOnTime(t)} style={{
                          padding: '7px 12px', borderRadius: 8, fontSize: 12, border: `1px solid ${pumpOnTime === t ? '#00A896' : 'rgba(255,255,255,0.1)'}`,
                          background: pumpOnTime === t ? 'rgba(0,168,150,0.15)' : 'rgba(255,255,255,0.05)',
                          color: pumpOnTime === t ? '#00A896' : 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 150ms'
                        }}>{t}</button>
                      ))}
                      <input type="time" value={pumpOnTime} onChange={e => setPumpOnTime(e.target.value)} style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 13, border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', fontFamily: F, transition: 'border-color 200ms'
                      }}
                        onFocus={e => e.currentTarget.style.borderColor = '#00A896'}
                        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontWeight: 600 }}>Hẹn giờ tắt / Thời lượng</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                      {['08:00', '10:00'].map(t => (
                        <button key={t} onClick={() => setPumpOffTime(t)} style={{
                          padding: '7px 12px', borderRadius: 8, fontSize: 12, border: `1px solid ${pumpOffTime === t ? '#00A896' : 'rgba(255,255,255,0.1)'}`,
                          background: pumpOffTime === t ? 'rgba(0,168,150,0.15)' : 'rgba(255,255,255,0.05)',
                          color: pumpOffTime === t ? '#00A896' : 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 150ms'
                        }}>{t}</button>
                      ))}
                      <input type="time" value={pumpOffTime} onChange={e => setPumpOffTime(e.target.value)} style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 13, border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', fontFamily: F, transition: 'border-color 200ms'
                      }}
                        onFocus={e => e.currentTarget.style.borderColor = '#00A896'}
                        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      {[{ l: 'Sau 1p', m: 1 }, { l: 'Sau 30p', m: 30 }, { l: 'Sau 1h', m: 60 }].map(item => (
                        <button key={item.l} onClick={() => {
                          const d = new Date(); d.setMinutes(d.getMinutes() + item.m);
                          setPumpOffTime(d.toTimeString().slice(0, 5));
                        }} style={{
                          padding: '7px 12px', borderRadius: 8, fontSize: 12, border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 150ms'
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                        >{item.l}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={async () => {
                    const { error, data: dev } = await supabase.from('devices').update({
                      pump_on_time: pumpOnTime || null,
                      pump_off_time: pumpOffTime || null
                    }).eq('tank_id', activeDevice).select('id').single();
                    if (!error && dev) {
                      await supabase.from('relay_logs').insert({
                        device_id: dev.id,
                        relay_name: 'Pump',
                        action: 'ON',
                        triggered_by: 'AUTO'
                      });
                      alert('Đã lưu cấu hình hẹn giờ Máy bơm!');
                    }
                  }} style={{
                    width: '100%', padding: '10px', marginTop: 10, borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: 'rgba(0,168,150,0.15)', border: '1px solid rgba(0,168,150,0.3)', color: '#00A896',
                    cursor: 'pointer', transition: 'all 200ms'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,168,150,0.25)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,168,150,0.15)'}
                  >
                    Lưu hẹn giờ Máy bơm
                  </button>
                </div>
              </div>

              {/* Đèn thủy sinh */}
              <div style={{
                padding: 24, borderRadius: 16, background: 'rgba(15,26,48,0.8)',
                border: `1px solid ${lightState ? '#FFB347' : 'rgba(26,45,74,0.5)'}`,
                transition: 'all 200ms', display: 'flex', flexDirection: 'column', gap: 24
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: lightState ? 'rgba(255,179,71,0.15)' : 'rgba(255,255,255,0.05)',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      transition: 'all 200ms'
                    }}>
                      <Lightbulb size={24} color={lightState ? '#FFB347' : 'rgba(255,255,255,0.3)'} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px', color: '#fff' }}>Đèn thủy sinh</h3>
                      <p style={{ fontSize: 13, margin: 0, color: lightState ? '#FFB347' : 'rgba(255,255,255,0.4)', transition: 'color 200ms' }}>
                        {lightState ? 'Đang hoạt động' : 'Đang tắt'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const newState = !lightState;
                      const { data: dev, error } = await supabase.from('devices')
                        .update({ relay_light_state: newState })
                        .eq('tank_id', activeDevice)
                        .select('id')
                        .single();
                      if (!error && dev) {
                        setLightState(newState);
                        await supabase.from('relay_logs').insert({
                          device_id: dev.id,
                          relay_name: 'Light',
                          action: newState ? 'ON' : 'OFF',
                          triggered_by: 'USER'
                        });
                      }
                    }}
                    style={{
                      width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: lightState ? '#FFB347' : 'rgba(255,255,255,0.1)',
                      boxShadow: lightState ? '0 0 20px rgba(255,179,71,0.4)' : 'none',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      transition: 'all 200ms', flexShrink: 0
                    }}
                  >
                    <Power size={24} color={lightState ? '#fff' : 'rgba(255,255,255,0.5)'} />
                  </button>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontWeight: 600 }}>Hẹn giờ bật</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      {['07:00', '09:00', '12:00'].map(t => (
                        <button key={t} onClick={() => setLightOnTime(t)} style={{
                          padding: '7px 12px', borderRadius: 8, fontSize: 12, border: `1px solid ${lightOnTime === t ? '#FFB347' : 'rgba(255,255,255,0.1)'}`,
                          background: lightOnTime === t ? 'rgba(255,179,71,0.15)' : 'rgba(255,255,255,0.05)',
                          color: lightOnTime === t ? '#FFB347' : 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 150ms'
                        }}>{t}</button>
                      ))}
                      <input type="time" value={lightOnTime} onChange={e => setLightOnTime(e.target.value)} style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 13, border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', fontFamily: F, transition: 'border-color 200ms'
                      }}
                        onFocus={e => e.currentTarget.style.borderColor = '#FFB347'}
                        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, fontWeight: 600 }}>Hẹn giờ tắt / Thời lượng</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                      {['08:00', '10:00'].map(t => (
                        <button key={t} onClick={() => setLightOffTime(t)} style={{
                          padding: '7px 12px', borderRadius: 8, fontSize: 12, border: `1px solid ${lightOffTime === t ? '#FFB347' : 'rgba(255,255,255,0.1)'}`,
                          background: lightOffTime === t ? 'rgba(255,179,71,0.15)' : 'rgba(255,255,255,0.05)',
                          color: lightOffTime === t ? '#FFB347' : 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 150ms'
                        }}>{t}</button>
                      ))}
                      <input type="time" value={lightOffTime} onChange={e => setLightOffTime(e.target.value)} style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 13, border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', fontFamily: F, transition: 'border-color 200ms'
                      }}
                        onFocus={e => e.currentTarget.style.borderColor = '#FFB347'}
                        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      {[{ l: 'Sau 1p', m: 1 }, { l: 'Sau 30p', m: 30 }, { l: 'Sau 1h', m: 60 }].map(item => (
                        <button key={item.l} onClick={() => {
                          const d = new Date(); d.setMinutes(d.getMinutes() + item.m);
                          setLightOffTime(d.toTimeString().slice(0, 5));
                        }} style={{
                          padding: '7px 12px', borderRadius: 8, fontSize: 12, border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 150ms'
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                        >{item.l}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={async () => {
                    const { error, data: dev } = await supabase.from('devices').update({
                      light_on_time: lightOnTime || null,
                      light_off_time: lightOffTime || null
                    }).eq('tank_id', activeDevice).select('id').single();
                    if (!error && dev) {
                      await supabase.from('relay_logs').insert({
                        device_id: dev.id,
                        relay_name: 'Light',
                        action: 'ON',
                        triggered_by: 'AUTO'
                      });
                      alert('Đã lưu cấu hình hẹn giờ Đèn thủy sinh!');
                    }
                  }} style={{
                    width: '100%', padding: '10px', marginTop: 10, borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: 'rgba(255,179,71,0.15)', border: '1px solid rgba(255,179,71,0.3)', color: '#FFB347',
                    cursor: 'pointer', transition: 'all 200ms'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,179,71,0.25)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,179,71,0.15)'}
                  >
                    Lưu hẹn giờ Đèn thủy sinh
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ═══ TAB: SENSORS ═══ */}
          {activeTab === 'sensors' && (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {SENSOR_CFG.map(cfg => (
                  <button key={cfg.key}
                    onClick={() => setSelectedSensor(cfg.key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: `1px solid ${selectedSensor === cfg.key ? cfg.color : 'rgba(255,255,255,0.08)'}`, background: selectedSensor === cfg.key ? `${cfg.color}15` : 'rgba(255,255,255,0.03)', color: selectedSensor === cfg.key ? cfg.color : 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F, transition: 'all 180ms' }}
                  >
                    <cfg.icon size={13} />
                    {cfg.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: 24, borderRadius: 20, background: 'rgba(15,26,48,0.9)', border: `1px solid ${selectedCfg.color}20`, marginBottom: 20 }}>
                {selectedSensor === 'waterLevel' ? (
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

                    <div style={{ height: 250, width: '100%', marginTop: 20 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={selectedHistory} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                          <defs>
                            <linearGradient id="colorBig" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={selectedCfg.color} stopOpacity={0.4} />
                              <stop offset="95%" stopColor={selectedCfg.color} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={true} />
                          <XAxis
                            dataKey="time"
                            stroke="rgba(255,255,255,0.3)"
                            fontSize={11}
                            tickMargin={12}
                            minTickGap={15}
                            tick={{ fill: 'rgba(255,255,255,0.5)' }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          />
                          <YAxis
                            stroke="rgba(255,255,255,0.3)"
                            fontSize={11}
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={(val) => val.toFixed(selectedCfg.key === 'ph' ? 2 : 1)}
                            tick={{ fill: 'rgba(255,255,255,0.5)' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                            formatter={(value: any) => [`${value} ${selectedCfg.unit}`, selectedCfg.label]}
                            labelFormatter={(label) => `Lúc ${label}`}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={selectedCfg.color}
                            fillOpacity={1}
                            fill="url(#colorBig)"
                            strokeWidth={3}
                            activeDot={{ r: 6, strokeWidth: 0, fill: selectedCfg.color }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </div>

              {selectedSensor !== 'waterLevel' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                  {[
                    { label: 'Hiện tại', value: `${latest[selectedSensor]}${selectedCfg.unit}` },
                    { label: 'Trung bình', value: `${(selectedHistory.reduce((a, d) => a + d.value, 0) / selectedHistory.length).toFixed(2)}${selectedCfg.unit}` },
                    { label: 'Cao nhất', value: `${Math.max(...selectedHistory.map(d => d.value)).toFixed(2)}${selectedCfg.unit}` },
                    { label: 'Thấp nhất', value: `${Math.min(...selectedHistory.map(d => d.value)).toFixed(2)}${selectedCfg.unit}` },
                  ].map(s => (
                    <div key={s.label} style={{ padding: '16px', borderRadius: 12, background: 'rgba(15,26,48,0.8)', border: `1px solid ${selectedCfg.color}15`, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: selectedCfg.color }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ═══ TAB: ALERTS ═══ */}
          {activeTab === 'alerts' && (
            <div className="alerts-grid" style={{ display: 'grid', gap: 24, flex: 1, minHeight: 0 }}>
              {/* Cột trái: Main Content */}
              <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0, overflowY: 'auto', paddingRight: 8 }}>
                <div style={{ border: `1px solid ${alertGlobalColor}40`, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ padding: '16px 20px', background: alertGlobalBg, display: 'flex', alignItems: 'center', gap: 12 }}>
                    {alerts.length
                      ? <AlertTriangle size={20} color={alertGlobalColor} />
                      : <CheckCircle size={20} color="#00A896" />}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: alertGlobalColor }}>
                        {alerts.length ? `${alerts.length} cảnh báo đang hoạt động` : 'Tất cả thông số trong ngưỡng an toàn'}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Cập nhật mỗi 3 giây</div>
                    </div>
                  </div>
                  {alerts.length > 0 && (
                    <div style={{ padding: 16 }}>
                      {alerts.map((a, i) => {
                        const isWarn = a.level === 'warn';
                        const color = isWarn ? '#FFB347' : '#FF6B6B';
                        const bg = isWarn ? 'rgba(255,179,71,0.07)' : 'rgba(255,107,107,0.07)';
                        const border = isWarn ? 'rgba(255,179,71,0.15)' : 'rgba(255,107,107,0.15)';
                        return (
                          <div key={i} style={{ padding: '14px 18px', borderRadius: 12, background: bg, border: `1px solid ${border}`, marginBottom: i < alerts.length - 1 ? 10 : 0, fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <AlertTriangle size={14} color={color} style={{ flexShrink: 0 }} />
                            {a.msg}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Hướng dẫn xử lý</h3>
                  {alerts.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Không có cảnh báo nào cần xử lý.</div>
                  ) : (
                    alerts.map((a, i) => {
                      const pondName = activePond?.name || 'Bể cá';
                      let title = '';
                      let desc = '';
                      let AlertIcon = AlertTriangle;
                      let iconColor = '#FF6B6B';
                      
                      if (a.level === 'warn') {
                        title = `Cảnh báo sớm: ${a.label}`;
                        desc = `${pondName} đang có dấu hiệu bất thường về ${a.label}. Vui lòng theo dõi và kiểm tra lại hệ thống.`;
                        AlertIcon = AlertCircle;
                        iconColor = '#FFB347';
                      } else if (a.level === 'danger' && a.key === 'waterLevel') {
                        title = `Nguy hiểm: Cạn nước`;
                        desc = `${pondName} CẠN NƯỚC! Hãy kiểm tra van bơm ngay lập tức để cứu cá!`;
                        AlertIcon = Droplets;
                        iconColor = '#FF6B6B';
                      } else {
                        title = `Nguy hiểm: ${a.label} bất thường`;
                        desc = `${pondName} đang gặp NGUY HIỂM! ${a.label} đã tụt giảm/tăng vọt bất thường về mức ${a.val}${a.unit}. Hãy đến kiểm tra bể và can thiệp ngay lập tức!`;
                        AlertIcon = AlertTriangle;
                        iconColor = '#FF6B6B';
                      }

                      // Bổ sung Gợi ý xử lý
                      const cfg = SENSOR_CFG.find(c => c.key === a.key);
                      if (cfg) {
                        const isHigh = a.val > cfg.good[1];
                        const isLow = a.val < cfg.good[0];

                        if (a.key === 'temp') {
                          if (isHigh) desc += "\nGợi ý: Bạn có thể bật quạt tản nhiệt/chiller hoặc thả đá lạnh (bọc túi nilon) để làm mát hồ cá từ từ.";
                          else if (isLow) desc += "\nGợi ý: Bạn nên bật máy sưởi hồ cá để nâng nhiệt độ lên từ từ, tránh làm cá sốc nhiệt.";
                        } else if (a.key === 'ph') {
                          if (isHigh) desc += "\nGợi ý: Bạn có thể thay 20-30% nước hoặc sử dụng lá bàng/dung dịch giảm pH chuyên dụng.";
                          else if (isLow) desc += "\nGợi ý: Bạn có thể bổ sung san hô vụn vào bộ lọc hoặc dùng dung dịch tăng pH.";
                        } else if (a.key === 'tds') {
                          desc += "\nGợi ý: Vui lòng thay 20-30% nước và kiểm tra lại vật liệu lọc của hệ thống máy bơm.";
                        } else if (a.key === 'waterLevel') {
                          desc += "\nGợi ý: Vui lòng châm thêm nước hoặc bật máy bơm. Kiểm tra xem hồ cá có bị rạn nứt hay rò rỉ ở đâu không.";
                        }
                      }

                      return (
                        <div key={i} style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 8, display: 'flex', gap: 14 }}>
                          <AlertIcon size={24} color={iconColor} style={{ flexShrink: 0, marginTop: 2 }} />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{title}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{desc}</div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Cột phải: Analytics & History */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0, height: '100%' }}>
                {/* Widget Thống kê */}
                <div style={{ padding: 20, borderRadius: 14, background: 'rgba(15,26,48,0.8)', border: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Phân bổ cảnh báo</h3>
                  <div style={{ height: 220, width: '100%' }}>
                    {alertDistData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 10, right: 0, bottom: 20, left: 0 }}>
                          <defs>
                            <filter id="pie3d" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="0" dy="6" stdDeviation="5" floodOpacity="0.3" floodColor="#000" />
                              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                              <feOffset dx="1" dy="2" result="offsetBlur" />
                              <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
                            </filter>
                          </defs>
                          <Pie
                            {...({ activeIndex: activePieIndex, activeShape: renderActiveShape } as any)}
                            onMouseEnter={onPieEnter}
                            data={alertDistData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={68}
                            paddingAngle={6}
                            stroke="none"
                            cornerRadius={4}
                          >
                            {alertDistData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} style={{ filter: 'url(#pie3d)' }} />
                            ))}
                          </Pie>
                          <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', bottom: -4 }} verticalAlign="bottom" height={30} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                        Chưa có dữ liệu thống kê
                      </div>
                    )}
                  </div>
                </div>

                {/* Widget Lịch sử */}
                <div style={{ padding: 20, borderRadius: 14, background: 'rgba(15,26,48,0.8)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexShrink: 0 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Lịch sử cảnh báo</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => { if (activeDevice) fetchAlertHistoryPage(currentHistoryPage - 1, activeDevice, historyCursors) }}
                        disabled={currentHistoryPage === 0 || historyLoading}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', color: currentHistoryPage === 0 ? 'rgba(255,255,255,0.2)' : '#fff', cursor: currentHistoryPage === 0 || historyLoading ? 'not-allowed' : 'pointer', fontSize: 11, transition: 'all 200ms' }}
                      >Trang trước</button>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Trang {currentHistoryPage + 1}</span>
                      <button
                        onClick={() => { if (activeDevice) fetchAlertHistoryPage(currentHistoryPage + 1, activeDevice, historyCursors) }}
                        disabled={!historyHasNext || historyLoading}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', color: !historyHasNext ? 'rgba(255,255,255,0.2)' : '#fff', cursor: !historyHasNext || historyLoading ? 'not-allowed' : 'pointer', fontSize: 11, transition: 'all 200ms' }}
                      >Trang sau</button>
                    </div>
                  </div>
                  <div className="custom-scrollbar" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', flex: 1, overflowY: 'auto' }}>
                    {alertHistory.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                        Chưa có lịch sử cảnh báo nào
                      </div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#152441', zIndex: 1 }}>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <th style={{ padding: '10px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Thời gian</th>
                            <th style={{ padding: '10px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Loại</th>
                            <th style={{ padding: '10px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Giá trị</th>
                            <th style={{ padding: '10px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {alertHistory.map(h => (
                            <tr key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.7)' }}>{new Date(h.created_at).toLocaleString('vi-VN')}</td>
                              <td style={{ padding: '12px 16px', color: '#fff' }}>{h.alert_type}</td>
                              <td style={{ padding: '12px 16px', color: '#FFB347' }}>{h.actual_value}</td>
                              <td style={{ padding: '12px 16px', color: h.is_read ? '#00A896' : '#FF6B6B' }}>
                                {h.is_read ? 'Đã xem' : 'Mới'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── Dialog: Thêm bể mới ── */}
      {addDialog && (
        <Dialog
          title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18} color="#00A896" /> Thêm bể cá mới</div>}
          confirmText="Thêm bể"
          error={dialogError}
          onConfirm={handleAddConfirm}
          onCancel={() => setAddDialog(false)}
        >
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Tên bể cá
            </label>
            <input
              autoFocus
              value={addName}
              onChange={e => setAddName(e.target.value)}
              placeholder="VD: Bể Rồng Phòng Ngủ"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                color: '#fff', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                transition: 'border-color 200ms',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Thể tích (Lít)
            </label>
            <input
              type="number"
              value={addVolume}
              onChange={e => setAddVolume(e.target.value)}
              placeholder="VD: 250"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                color: '#fff', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                transition: 'border-color 200ms',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'}
            />
          </div>
          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Loài cá (Tùy chọn)
            </label>
            <select
              value={addSpeciesId}
              onChange={e => setAddSpeciesId(Number(e.target.value))}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                color: '#fff', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                transition: 'border-color 200ms', appearance: 'none'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'}
            >
              <option value={0} style={{ color: '#000' }}>-- Chọn loài cá --</option>
              {fishSpecies.map(sp => (
                <option key={sp.id} value={sp.id} style={{ color: '#000' }}>{sp.species_name}</option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: 12, marginBottom: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Mã thiết bị (MAC Address)
            </label>
            <input
              value={addMacAddress}
              onChange={e => setAddMacAddress(e.target.value)}
              placeholder="VD: 68:FE:71:16:A5:18 hoặc để trống"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                color: '#fff', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                transition: 'border-color 200ms',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'}
            />
          </div>
        </Dialog>
      )}

      {/* ── Dialog: Cấu hình bể cá ── */}
      {editDialog && (
        <Dialog
          title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Pencil size={18} color="#4DA6FF" /> Cấu hình bể cá</div>}
          confirmText="Lưu thay đổi"
          error={dialogError}
          onConfirm={handleEditConfirm}
          onCancel={() => setEditDialog(null)}
        >
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Tên bể cá
            </label>
            <input
              autoFocus
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="VD: Bể Rồng Phòng Ngủ"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                color: '#fff', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                transition: 'border-color 200ms',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Thể tích (Lít)
            </label>
            <input
              type="number"
              value={editVolume}
              onChange={e => setEditVolume(e.target.value)}
              placeholder="VD: 250"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                color: '#fff', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                transition: 'border-color 200ms',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'}
            />
          </div>
          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Loài cá (Tùy chọn)
            </label>
            <select
              value={editSpeciesId}
              onChange={e => setEditSpeciesId(Number(e.target.value))}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                color: '#fff', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                transition: 'border-color 200ms', appearance: 'none'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'}
            >
              <option value={0} style={{ color: '#000' }}>-- Chọn loài cá --</option>
              {fishSpecies.map(sp => (
                <option key={sp.id} value={sp.id} style={{ color: '#000' }}>{sp.species_name}</option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: 12, marginBottom: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Mã thiết bị (MAC Address)
            </label>
            <input
              value={editMacAddress}
              onChange={e => setEditMacAddress(e.target.value)}
              placeholder="VD: 68:FE:71:16:A5:18 hoặc để trống"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                color: '#fff', outline: 'none', fontFamily: F, boxSizing: 'border-box',
                transition: 'border-color 200ms',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'}
            />
          </div>
        </Dialog>
      )}

      {/* ── Dialog: Xác nhận xóa ── */}
      {deleteDialog && (
        <Dialog
          title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Trash2 size={18} color="#FF6B6B" /> Xóa bể cá</div>}
          message={`Bạn có chắc muốn xóa "${deleteDialog.name}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa bể"
          confirmColor="#FF6B6B"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteDialog(null)}
        />
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dialogIn { from { opacity:0; transform:scale(0.93); } to { opacity:1; transform:scale(1); } }
        @media (max-width: 768px) { aside { display: none !important; } }
        @media (min-width: 1024px) { .alerts-grid { grid-template-columns: 1.5fr 1fr; } }
        @media (max-width: 1023px) { .alerts-grid { grid-template-columns: 1fr; } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  )
}
