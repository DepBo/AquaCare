import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from 'react'
import { ArrowUpRight, ChevronRight, Pencil } from 'lucide-react'
import './FeedbackButton.css'

const feedbackUrl = 'https://forms.gle/mKFwk4N73y5SxCTj9'
const positionKey = 'aquacare-feedback-position'
const margin = 8

type Position = { left: number; top: number }
type DragState = { pointerId: number; x: number; y: number; left: number; top: number; width: number; height: number; moved: boolean }

function clampPosition(position: Position, width: number, height: number): Position {
  return {
    left: Math.max(margin, Math.min(position.left, window.innerWidth - width - margin)),
    top: Math.max(margin, Math.min(position.top, window.innerHeight - height - margin)),
  }
}

export default function FeedbackButton() {
  const [collapsed, setCollapsed] = useState(false)
  const [position, setPosition] = useState<Position | null>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(positionKey) || 'null')
      return typeof saved?.left === 'number' && Number.isFinite(saved.left)
        && typeof saved?.top === 'number' && Number.isFinite(saved.top) ? saved : null
    } catch { return null }
  })
  const elementRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const frameRef = useRef<number | null>(null)
  const pendingRef = useRef<Position | null>(null)
  const suppressClickRef = useRef(false)

  useEffect(() => {
    const keepInView = () => {
      const element = elementRef.current
      if (element) setPosition(current => current && clampPosition(current, element.offsetWidth, element.offsetHeight))
    }
    keepInView()
    window.addEventListener('resize', keepInView)
    return () => {
      window.removeEventListener('resize', keepInView)
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [collapsed])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    const element = elementRef.current
    if (!element) return
    const bounds = element.getBoundingClientRect()
    dragRef.current = {
      pointerId: event.pointerId, x: event.clientX, y: event.clientY,
      left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height, moved: false,
    }
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const element = elementRef.current
    if (!drag || !element || drag.pointerId !== event.pointerId) return
    const dx = event.clientX - drag.x
    const dy = event.clientY - drag.y
    if (!drag.moved && Math.hypot(dx, dy) < 5) return
    if (!drag.moved) {
      element.setPointerCapture(event.pointerId)
      element.style.willChange = 'transform'
    }
    drag.moved = true
    pendingRef.current = clampPosition({ left: drag.left + dx, top: drag.top + dy }, drag.width, drag.height)
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(() => {
        const next = pendingRef.current
        if (next && elementRef.current && dragRef.current) {
          elementRef.current.style.transform = `translate3d(${next.left - drag.left}px, ${next.top - drag.top}px, 0)`
        }
        frameRef.current = null
      })
    }
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    if (drag.moved) {
      suppressClickRef.current = true
      window.setTimeout(() => { suppressClickRef.current = false }, 0)
      const element = elementRef.current
      if (element) {
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
        frameRef.current = null
        const next = clampPosition({ left: drag.left + event.clientX - drag.x, top: drag.top + event.clientY - drag.y }, drag.width, drag.height)
        element.style.left = `${next.left}px`
        element.style.top = `${next.top}px`
        element.style.right = 'auto'
        element.style.bottom = 'auto'
        element.style.transform = ''
        element.style.willChange = ''
        setPosition(next)
        try { localStorage.setItem(positionKey, JSON.stringify(next)) } catch { /* storage unavailable */ }
      }
    }
    dragRef.current = null
    if (elementRef.current?.hasPointerCapture(event.pointerId)) {
      elementRef.current.releasePointerCapture(event.pointerId)
    }
  }

  const onClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return
    event.preventDefault()
    event.stopPropagation()
    suppressClickRef.current = false
  }

  return (
    <div
      ref={elementRef}
      className={`feedback-entry${collapsed ? ' feedback-entry--collapsed' : ''}`}
      style={position ? { left: position.left, top: position.top, right: 'auto', bottom: 'auto' } : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
        frameRef.current = null
        dragRef.current = null
        if (elementRef.current) {
          elementRef.current.style.transform = ''
          elementRef.current.style.willChange = ''
        }
      }}
      onClickCapture={onClickCapture}
    >
      <a className="feedback-entry__link" href={feedbackUrl} target="_blank" rel="noopener noreferrer"
        aria-label="Mở form góp ý AquaCare" title="Mở form góp ý">
        <span className="feedback-entry__icon"><Pencil size={19} strokeWidth={2.4} /></span>
        {!collapsed && <span className="feedback-entry__copy"><strong>Chia sẻ góp ý</strong><small>Giúp AquaCare tốt hơn</small></span>}
      </a>
      <button type="button" className="feedback-entry__toggle"
        onClick={() => setCollapsed(value => !value)}
        aria-label={collapsed ? 'Mở rộng nút góp ý' : 'Thu nhỏ nút góp ý'}
        title={collapsed ? 'Mở rộng' : 'Thu nhỏ'}>
        {collapsed ? <ChevronRight size={18} /> : <ArrowUpRight size={19} />}
      </button>
    </div>
  )
}
