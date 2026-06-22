import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Droplets, Thermometer, Wind, Fish, Coins, Apple } from 'lucide-react'

const F = "'Inter', sans-serif"

interface Fish {
  id: number; x: number; y: number; size: number; age: number; health: number; stage: 'baby' | 'juvenile' | 'adult' | 'harvest'
  dx: number; dy: number; emoji: string
}

interface WaterQuality { ph: number; temp: number; oxygen: number }

const STAGE_INFO = {
  baby: { emoji: '🐠', label: 'Cá cảnh con', minAge: 0, color: '#FFB347' },
  juvenile: { emoji: '🐠', label: 'Cá cảnh vị thành niên', minAge: 30, color: '#4DA6FF' },
  adult: { emoji: '🐟', label: 'Cá cảnh trưởng thành', minAge: 60, color: '#00A896' },
  harvest: { emoji: '🐟', label: 'Sẵn sàng thu hoạch', minAge: 90, color: '#FF6B6B' },
}

function getStage(age: number): Fish['stage'] {
  if (age >= 90) return 'harvest'
  if (age >= 60) return 'adult'
  if (age >= 30) return 'juvenile'
  return 'baby'
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }

export default function FishFarmGame() {
  const [coins, setCoins] = useState(500)
  const [day, setDay] = useState(0)
  const [fishes, setCrabs] = useState<Fish[]>([])
  const [water, setWater] = useState<WaterQuality>({ ph: 7.5, temp: 26, oxygen: 6.5 })
  const [foodLevel, setFoodLevel] = useState(80)
  const [messages, setMessages] = useState<string[]>(['🎮 Chào mừng đến nông trại cá cảnh AquaCare!', '💡 Mua cá cảnh con để bắt đầu nuôi.'])
  const [harvested, setHarvested] = useState(0)
  const [gameSpeed, setGameSpeed] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [ripples, setRipples] = useState<{x:number;y:number;id:number}[]>([])

  const addMsg = useCallback((msg: string) => {
    setMessages(p => [msg, ...p].slice(0, 20))
  }, [])

  // Game tick — only runs when there are fishes
  useEffect(() => {
    if (isPaused || fishes.length === 0) return
    const interval = setInterval(() => {
      setDay(d => d + 1)
      // Water quality drift
      setWater(w => ({
        ph: clamp(w.ph + (Math.random() - 0.52) * 0.15, 5, 9),
        temp: clamp(w.temp + (Math.random() - 0.5) * 0.5, 18, 38),
        oxygen: clamp(w.oxygen + (Math.random() - 0.52) * 0.2, 2, 10),
      }))
      // Food decreases
      setFoodLevel(f => clamp(f - 2 - fishes.length * 0.3, 0, 100))
      // Fishes grow
      setCrabs(prev => prev.map(c => {
        const healthDelta = getHealthDelta(water, foodLevel)
        const newHealth = clamp(c.health + healthDelta, 0, 100)
        const newAge = c.age + (newHealth > 40 ? 1 : 0)
        const stage = getStage(newAge)
        const sizeMap = { baby: 24, juvenile: 32, adult: 40, harvest: 48 }
        return {
          ...c,
          age: newAge,
          health: newHealth,
          stage,
          size: sizeMap[stage],
          emoji: STAGE_INFO[stage].emoji,
          x: clamp(c.x + c.dx * 3, 5, 95),
          y: clamp(c.y + c.dy * 2, 5, 95),
          dx: (c.x <= 5 || c.x >= 95) ? -c.dx : (Math.random() > 0.85 ? (Math.random() - 0.5) * 4 : c.dx),
          dy: (c.y <= 5 || c.y >= 95) ? -c.dy : (Math.random() > 0.85 ? (Math.random() - 0.5) * 4 : c.dy),
        }
      }).filter(c => {
        if (c.health <= 0) { addMsg(`💀 Một con cá cảnh đã chết!`); return false }
        return true
      }))
    }, 2000 / gameSpeed)
    return () => clearInterval(interval)
  }, [isPaused, gameSpeed, water, foodLevel, fishes.length, addMsg])

  // Warnings
  useEffect(() => {
    if (water.ph < 6.5 || water.ph > 8.5) addMsg('⚠️ pH nước bất thường!')
    if (water.temp > 32 || water.temp < 22) addMsg('⚠️ Nhiệt độ nước nguy hiểm!')
    if (water.oxygen < 4) addMsg('⚠️ Oxy hòa tan quá thấp!')
    if (foodLevel < 20) addMsg('🍽️ Cá cảnh đang đói! Hãy cho ăn.')
  }, [day])

  function getHealthDelta(w: WaterQuality, food: number) {
    let d = 0
    if (w.ph >= 7 && w.ph <= 8.2) d += 2; else if (w.ph < 6.5 || w.ph > 8.5) d -= 4; else d -= 1
    if (w.temp >= 24 && w.temp <= 30) d += 2; else if (w.temp < 22 || w.temp > 32) d -= 4; else d -= 1
    if (w.oxygen >= 5) d += 2; else if (w.oxygen < 4) d -= 4; else d -= 1
    if (food > 50) d += 1; else if (food < 20) d -= 3
    return d
  }

  const buyCrab = () => {
    if (coins < 50) { addMsg('❌ Không đủ tiền!'); return }
    if (fishes.length >= 20) { addMsg('❌ Ao đã đầy! Tối đa 20 con.'); return }
    setCoins(c => c - 50)
    setCrabs(p => [...p, {
      id: Date.now() + Math.random(),
      x: 20 + Math.random() * 60, y: 20 + Math.random() * 60,
      size: 24, age: 0, health: 100, stage: 'baby',
      dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4,
      emoji: '🐠',
    }])
    addMsg('🐠 Đã mua 1 cá cảnh con! (-50 xu)')
  }

  const feedCrabs = () => {
    if (coins < 20) { addMsg('❌ Không đủ tiền mua thức ăn!'); return }
    setCoins(c => c - 20)
    setFoodLevel(f => clamp(f + 30, 0, 100))
    addMsg('🍖 Đã cho cá cảnh ăn! (-20 xu)')
  }

  const adjustWater = () => {
    if (coins < 30) { addMsg('❌ Không đủ tiền!'); return }
    setCoins(c => c - 30)
    setWater({ ph: 7.5 + (Math.random() - 0.5) * 0.3, temp: 27 + (Math.random() - 0.5), oxygen: 6.5 + Math.random() * 0.5 })
    addMsg('💧 Đã xử lý nước! (-30 xu)')
  }

  const harvestCrab = (id: number) => {
    const fish = fishes.find(c => c.id === id)
    if (!fish || fish.stage !== 'harvest') { addMsg('❌ Cá cảnh chưa đủ lớn để thu hoạch!'); return }
    const price = Math.floor(80 + fish.health * 1.5)
    setCoins(c => c + price)
    setCrabs(p => p.filter(c => c.id !== id))
    setHarvested(h => h + 1)
    addMsg(`🎉 Thu hoạch 1 cá cảnh! +${price} xu`)
  }

  const harvestAll = () => {
    const ready = fishes.filter(c => c.stage === 'harvest')
    if (ready.length === 0) { addMsg('❌ Không có cá cảnh nào sẵn sàng thu hoạch!'); return }
    let total = 0
    ready.forEach(c => { total += Math.floor(80 + c.health * 1.5) })
    setCoins(c => c + total)
    setCrabs(p => p.filter(c => c.stage !== 'harvest'))
    setHarvested(h => h + ready.length)
    addMsg(`🎉 Thu hoạch ${ready.length} cá cảnh! +${total} xu`)
  }

  const handlePondClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setRipples(p => [...p, { x, y, id: Date.now() }])
    setTimeout(() => setRipples(p => p.slice(1)), 1500)
  }

  const waterStatus = (val: number, good: [number, number], warn: [number, number]) => {
    if (val >= good[0] && val <= good[1]) return '#00A896'
    if (val >= warn[0] && val <= warn[1]) return '#FFB347'
    return '#FF6B6B'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #060e1a 0%, #0a1628 50%, #0d2235 100%)', fontFamily: F, color: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(26,45,74,0.4)', background: 'rgba(10,22,40,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 12 }}>
            <ArrowLeft size={14} /> Trang chủ
          </Link>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.04em' }}>🐠 AQUACARE FARM</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Coins size={16} color="#FFB347" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#FFB347' }}>{coins}</span>
          </div>
          <div style={{ fontSize: 11, color: day === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.4)' }}>{day === 0 ? 'Chưa bắt đầu' : `Ngày ${day}`}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Thu hoạch: {harvested}</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setIsPaused(!isPaused)} style={{ ...btnSmall, background: isPaused ? 'rgba(255,107,107,0.2)' : 'rgba(0,229,160,0.15)', color: isPaused ? '#FF6B6B' : '#00A896' }}>
              {isPaused ? '▶' : '⏸'}
            </button>
            <button onClick={() => setGameSpeed(s => s === 1 ? 2 : s === 2 ? 3 : s === 3 ? 5 : 1)} style={{ ...btnSmall, color: '#4DA6FF' }}>
              {gameSpeed}x
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }} className="game-layout">
        {/* Left: Pond + Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Pond */}
          <div onClick={handlePondClick} style={{
            position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
            background: 'linear-gradient(180deg, #0a3d5c 0%, #0c4a6e 30%, #164e63 60%, #1a5c4c 100%)',
            border: '2px solid rgba(0,229,160,0.15)',
            boxShadow: '0 0 60px rgba(0,229,160,0.08), inset 0 0 80px rgba(0,100,200,0.1)',
          }}>
            {/* Water surface shimmer */}
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, transparent, rgba(255,255,255,0.02) 200px, transparent 400px)', animation: 'shimmer 8s linear infinite' }} />
            {/* Bubbles */}
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute', width: 6 + i * 2, height: 6 + i * 2, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                left: `${15 + i * 14}%`, bottom: 0,
                animation: `bubbleUp ${4 + i}s ease-in-out infinite ${i * 0.5}s`,
              }} />
            ))}
            {/* Ripples */}
            {ripples.map(r => (
              <div key={r.id} style={{
                position: 'absolute', left: `${r.x}%`, top: `${r.y}%`, width: 0, height: 0,
                border: '2px solid rgba(255,255,255,0.15)', borderRadius: '50%',
                transform: 'translate(-50%,-50%)',
                animation: 'ripple 1.2s ease-out forwards',
              }} />
            ))}
            {/* Fishes */}
            {fishes.map(c => (
              <div key={c.id} onClick={e => { e.stopPropagation(); harvestCrab(c.id) }}
                title={`${STAGE_INFO[c.stage].label} | HP: ${Math.round(c.health)} | Tuổi: ${c.age}`}
                style={{
                  position: 'absolute', left: `${c.x}%`, top: `${c.y}%`,
                  fontSize: c.size, cursor: c.stage === 'harvest' ? 'pointer' : 'default',
                  transform: 'translate(-50%,-50%)', transition: `left ${2000 / gameSpeed}ms linear, top ${2000 / gameSpeed}ms linear`,
                  filter: c.health < 30 ? 'grayscale(0.5)' : 'none',
                  animation: c.stage === 'harvest' ? 'harvestPulse 1s ease-in-out infinite' : 'none',
                }}>
                <div style={{ display: 'inline-block', transform: `scaleX(${c.dx > 0 ? -1 : 1})`, transition: 'transform 0.3s' }}>
                  {c.emoji}
                </div>
                {c.stage !== 'harvest' && (
                  <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: c.size * 0.8, height: 3, background: 'rgba(0,0,0,0.4)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (c.age / 90) * 100)}%`, height: '100%', background: '#00A896' }} />
                  </div>
                )}
                {c.health < 50 && <span style={{ position: 'absolute', top: -8, right: -8, fontSize: 10 }}>❤️‍🩹</span>}
                {c.stage === 'harvest' && <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', fontSize: 8, background: 'rgba(0,229,160,0.8)', color: '#fff', padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap', fontWeight: 600, fontFamily: F }}>THU HOẠCH</span>}
              </div>
            ))}
            {fishes.length === 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                <Fish size={40} color="rgba(255,255,255,0.15)" />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>Ao trống — Mua cá cảnh con để bắt đầu!</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }} className="action-grid">
            <ActionBtn icon="🐠" label="Mua cá cảnh con" sub="50 xu" color="#FFB347" onClick={buyCrab} />
            <ActionBtn icon="🍖" label="Cho ăn" sub="20 xu" color="#00A896" onClick={feedCrabs} />
            <ActionBtn icon="💧" label="Xử lý nước" sub="30 xu" color="#4DA6FF" onClick={adjustWater} />
            <ActionBtn icon="📦" label="Thu hoạch tất cả" sub={`${fishes.filter(c=>c.stage==='harvest').length} con`} color="#FF6B6B" onClick={harvestAll} />
          </div>
        </div>

        {/* Right: Stats + Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Water Quality */}
          <Panel title="Chất lượng nước">
            <Meter icon={<Droplets size={14} />} label="pH" value={water.ph.toFixed(1)} bar={water.ph / 14 * 100} color={waterStatus(water.ph, [7, 8.2], [6.5, 8.5])} />
            <Meter icon={<Thermometer size={14} />} label="Nhiệt độ" value={`${water.temp.toFixed(1)}°C`} bar={(water.temp - 15) / 25 * 100} color={waterStatus(water.temp, [24, 30], [22, 32])} />
            <Meter icon={<Wind size={14} />} label="Oxy (DO)" value={`${water.oxygen.toFixed(1)} mg/L`} bar={water.oxygen / 10 * 100} color={waterStatus(water.oxygen, [5, 10], [4, 10])} />
          </Panel>

          {/* Farm stats */}
          <Panel title="Trạng thái trang trại">
            <Meter icon={<Apple size={14} />} label="Thức ăn" value={`${Math.round(foodLevel)}%`} bar={foodLevel} color={foodLevel > 50 ? '#00A896' : foodLevel > 20 ? '#FFB347' : '#FF6B6B'} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              <StatBox label="Tổng cá cảnh" value={fishes.length} color="#4DA6FF" />
              <StatBox label="Cá cảnh con" value={fishes.filter(c=>c.stage==='baby').length} color="#FFB347" />
              <StatBox label="Trưởng thành" value={fishes.filter(c=>c.stage==='adult').length} color="#00A896" />
              <StatBox label="Sẵn thu hoạch" value={fishes.filter(c=>c.stage==='harvest').length} color="#FF6B6B" />
            </div>
          </Panel>

          {/* Log */}
          <Panel title="Nhật ký">
            <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ fontSize: 11, color: i === 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>{m}</div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-400px); } 100% { transform: translateX(400px); } }
        @keyframes bubbleUp { 0%,100% { transform: translateY(0); opacity:0; } 20% { opacity:1; } 80% { opacity:0.5; } 90% { transform: translateY(-300px); opacity:0; } }
        @keyframes ripple { 0% { width:0;height:0;opacity:1; } 100% { width:80px;height:80px;opacity:0; } }
        @keyframes harvestPulse { 0%,100% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-50%,-50%) scale(1.15); } }
        @media (max-width: 900px) { .game-layout { grid-template-columns: 1fr !important; } .action-grid { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>
    </div>
  )
}

const btnSmall: React.CSSProperties = { padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: "'Inter',sans-serif" }

function ActionBtn({ icon, label, sub, color, onClick }: { icon: string; label: string; sub: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '14px 12px', borderRadius: 14, border: `1px solid ${color}20`, cursor: 'pointer',
      background: `${color}08`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      transition: 'all 200ms', fontFamily: F,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.background = `${color}08`; e.currentTarget.style.borderColor = `${color}20`; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{label}</span>
      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{sub}</span>
    </button>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 16, borderRadius: 14, background: 'rgba(17,29,51,0.6)', border: '1px solid rgba(26,45,74,0.5)', backdropFilter: 'blur(8px)' }}>
      <h3 style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{title}</h3>
      {children}
    </div>
  )
}

function Meter({ icon, label, value, bar, color }: { icon: React.ReactNode; label: string; value: string; bar: number; color: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color }}>{icon}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{label}</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{value}</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${clamp(bar, 0, 100)}%`, background: color, borderRadius: 2, transition: 'width 500ms ease' }} />
      </div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ padding: '8px 10px', borderRadius: 8, background: `${color}08`, border: `1px solid ${color}15`, textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{label}</div>
    </div>
  )
}
