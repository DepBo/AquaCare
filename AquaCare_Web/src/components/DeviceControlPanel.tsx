import { CalendarDays, Clock3, Droplets, Lightbulb, Save, Wind } from 'lucide-react'
import { useState } from 'react'
import type { CSSProperties } from 'react'
import { scheduleAfterMinutes } from './deviceScheduleTime'
import './DeviceControlPanel.css'

export type DeviceControlItem = {
  id: 'pump' | 'light' | 'aerator'
  title: string
  description: string
  active: boolean
  pending: boolean
  onTime: string
  offTime: string
  isDaily: boolean
  runDate: string
  saved: boolean
  saving: boolean
  onToggle: () => void
  onOnTimeChange: (value: string) => void
  onOffTimeChange: (value: string) => void
  onDailyChange: (value: boolean) => void
  onRunDateChange: (value: string) => void
  onClear: () => void
  onSave: () => void
}

const icons = { pump: Droplets, light: Lightbulb, aerator: Wind }
const durationPresets = [{ label: 'Sau 1p', minutes: 1 }, { label: 'Sau 30p', minutes: 30 }, { label: 'Sau 1h', minutes: 60 }]

function positionForTime(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(value)
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return null
  return ((hour * 60 + minute) / 1440) * 100
}

function DeviceCard({ item }: { item: DeviceControlItem }) {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
  const Icon = icons[item.id]
  const style = { '--device-color': `var(--device-${item.id})` } as CSSProperties
  const setDuration = (minutes: number) => {
    const schedule = scheduleAfterMinutes(item.onTime, minutes)
    setSelectedDuration(minutes)
    if (!item.onTime) {
      item.onOnTimeChange(schedule.onTime)
      if (!item.isDaily) {
        const now = new Date()
        item.onRunDateChange(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`)
      }
    }
    item.onOffTimeChange(schedule.offTime)
  }
  const setOnTime = (value: string) => {
    setSelectedDuration(null)
    item.onOnTimeChange(value)
  }
  const setOffTime = (value: string) => {
    setSelectedDuration(null)
    item.onOffTimeChange(value)
  }
  const clearSchedule = () => {
    setSelectedDuration(null)
    item.onClear()
  }

  return (
    <article className={`device-control-card device-control-${item.id}`} style={style}>
      <div className="device-control-card-head">
        <span className="device-control-icon"><Icon size={27} strokeWidth={2.1} /></span>
        <div className="device-control-heading">
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
        <span className={`device-control-status ${item.active ? 'is-on' : ''} ${item.pending ? 'is-pending' : ''}`}
          aria-live="polite">
          <span className="device-control-dot" />{item.pending ? 'Đang xử lý' : item.active ? 'Đang bật' : 'Đang tắt'}
        </span>
        <button className={`device-control-switch ${item.active ? 'is-on' : ''}`} type="button"
          role="switch" aria-checked={item.active} aria-busy={item.pending} disabled={item.pending}
          aria-label={`${item.active ? 'Tắt' : 'Bật'} ${item.title}`}
          onClick={item.onToggle}><span /></button>
      </div>

      <div className="device-control-card-body">
        <div className="device-control-schedule-mode">
          <label className="device-control-repeat">
            <input type="checkbox" checked={item.isDaily}
              onChange={event => item.onDailyChange(event.target.checked)} />
            Lặp lại hằng ngày
          </label>
          {!item.isDaily && <input className="device-control-date" type="date"
            aria-label={`Ngày chạy ${item.title}`} value={item.runDate}
            onChange={event => item.onRunDateChange(event.target.value)} />}
        </div>
        <div className="device-control-field">
          <label>Hẹn giờ bật</label>
          <div className="device-control-options">
            {['07:00', '09:00', '12:00'].map(time => (
              <button key={time} type="button" className={item.onTime === time ? 'selected' : ''}
                onClick={() => setOnTime(time)}>{time}</button>
            ))}
            <input aria-label={`Giờ bật ${item.title}`} type="time" value={item.onTime}
              onChange={event => setOnTime(event.target.value)} />
          </div>
        </div>
        <div className="device-control-field">
          <label>Hẹn giờ tắt</label>
          <div className="device-control-options">
            {['08:00', '10:00'].map(time => (
              <button key={time} type="button" className={item.offTime === time ? 'selected' : ''}
                onClick={() => setOffTime(time)}>{time}</button>
            ))}
            <input aria-label={`Giờ tắt ${item.title}`} type="time" value={item.offTime}
              onChange={event => setOffTime(event.target.value)} />
          </div>
        </div>
        <div className="device-control-field">
          <label>Thời lượng chạy thêm</label>
          <div className="device-control-options">
            {durationPresets.map(preset => (
              <button key={preset.label} type="button"
                className={selectedDuration === preset.minutes ? 'selected' : ''}
                aria-pressed={selectedDuration === preset.minutes}
                onClick={() => setDuration(preset.minutes)}>{preset.label}</button>
            ))}
          </div>
        </div>
        <div className="device-control-card-actions">
          {item.saved && <button className="device-control-clear" type="button" disabled={item.saving}
            onClick={clearSchedule}>Hủy lịch</button>}
          <button className="device-control-save" type="button" disabled={item.saving} onClick={item.onSave}>
            <Save size={16} /> Lưu lịch
          </button>
        </div>
      </div>
    </article>
  )
}

function ScheduleTimeline({ items }: { items: DeviceControlItem[] }) {
  return (
    <section className="device-control-timeline">
      <div className="device-control-timeline-head">
        <span className="device-control-calendar"><CalendarDays size={22} /></span>
        <div><h2>Lịch điều khiển</h2><p>Các mốc giờ đã chọn; lịch một lần chạy vào ngày được đặt</p></div>
      </div>
      <div className="device-control-timeline-scroll">
        <div className="device-control-timeline-content">
          <div className="device-control-timeline-axis">
            <span>Thiết bị</span>
            <div>{[0, 4, 8, 12, 16, 20, 24].map(hour => <span key={hour} style={{ left: `${hour / 24 * 100}%` }}>{String(hour).padStart(2, '0')}:00</span>)}</div>
          </div>
          {items.map(item => {
            const Icon = icons[item.id]
            const onPosition = positionForTime(item.onTime)
            const offPosition = positionForTime(item.offTime)
            const crossesMidnight = onPosition !== null && offPosition !== null && offPosition < onPosition
            return <div className={`device-control-timeline-row device-control-${item.id}`} key={item.id}
              style={{ '--device-color': `var(--device-${item.id})` } as CSSProperties}>
              <div className="device-control-timeline-name"><span><Icon size={17} /></span>{item.title}</div>
              <div className="device-control-track">
                {onPosition !== null && offPosition !== null && onPosition < offPosition &&
                  <span className="device-control-duration" style={{ left: `${onPosition}%`, width: `${offPosition - onPosition}%` }} />}
                {crossesMidnight && <>
                  <span className="device-control-duration" style={{ left: `${onPosition}%`, width: `${100 - onPosition}%` }} />
                  <span className="device-control-duration" style={{ left: 0, width: `${offPosition}%` }} />
                </>}
                {onPosition !== null && <span className="device-control-marker on" style={{ left: `${onPosition}%` }}
                  title={`${item.title}: Bật ${item.onTime}`}><b>{item.onTime}</b><small>Bật</small></span>}
                {offPosition !== null && <span className="device-control-marker off" style={{ left: `${offPosition}%` }}
                  title={`${item.title}: Tắt ${item.offTime}${crossesMidnight ? ' ngày hôm sau' : ''}`}><b>{item.offTime}</b><small>{crossesMidnight ? 'Tắt +1 ngày' : 'Tắt'}</small></span>}
                {onPosition === null && offPosition === null && <span className="device-control-no-schedule">Chưa đặt lịch</span>}
              </div>
            </div>
          })}
        </div>
      </div>
      <p className="device-control-timeline-note"><Clock3 size={14} /> Lưu lịch để áp dụng giờ đã chọn cho thiết bị.</p>
    </section>
  )
}

export default function DeviceControlPanel({ items }: { items: DeviceControlItem[] }) {
  return <div className="device-control-page">
    <section className="device-control-summary">
      <div className="device-control-summary-copy"><h2>Thiết bị trong hồ</h2><p>Tình trạng hoạt động hiện tại của các thiết bị</p></div>
      <div className="device-control-summary-items">
        {items.map(item => {
          const Icon = icons[item.id]
          return <div className={`device-control-summary-item device-control-${item.id}`} key={item.id}
            style={{ '--device-color': `var(--device-${item.id})` } as CSSProperties}>
            <span className="device-control-icon"><Icon size={25} /></span>
            <div><strong>{item.title}</strong><span className={item.active ? 'is-on' : ''}>
              <i />{item.pending ? 'Đang xử lý' : item.active ? 'Đang bật' : 'Đang tắt'}</span></div>
          </div>
        })}
      </div>
    </section>
    <div className="device-control-grid">{items.map(item => <DeviceCard item={item} key={item.id} />)}</div>
    <ScheduleTimeline items={items} />
  </div>
}
