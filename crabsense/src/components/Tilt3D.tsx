import { useRef, useState, type ReactNode, type CSSProperties } from 'react'

interface Tilt3DProps {
  children: ReactNode
  intensity?: number
  perspective?: number
  scale?: number
  glare?: boolean
  style?: CSSProperties
  className?: string
}

export default function Tilt3D({
  children,
  intensity = 8,
  perspective = 800,
  scale = 1.02,
  glare = true,
  style,
  className,
}: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('')
  const [glareStyle, setGlareStyle] = useState<CSSProperties>({})
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rotateX = (0.5 - y) * intensity
    const rotateY = (x - 0.5) * intensity

    setTransform(
      `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
    )

    if (glare) {
      setGlareStyle({
        position: 'absolute' as const,
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: 'inherit',
        background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(0,229,160,0.08) 0%, transparent 60%)`,
        pointerEvents: 'none' as const,
        zIndex: 2,
      })
    }
  }

  const handleMouseLeave = () => {
    setTransform('')
    setGlareStyle({})
    setIsHovered(false)
  }

  const handleMouseEnter = () => setIsHovered(true)

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        transformStyle: 'preserve-3d',
        transform: transform || 'perspective(800px) rotateX(0) rotateY(0)',
        transition: isHovered ? 'transform 100ms ease-out' : 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
      {glare && isHovered && <div style={glareStyle} />}
    </div>
  )
}
