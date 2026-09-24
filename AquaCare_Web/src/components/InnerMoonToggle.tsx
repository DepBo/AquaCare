import { useState } from 'react'

interface InnerMoonToggleProps {
  toggled: boolean
  onToggle: () => void
  size?: number
  borderColorVar?: string
  bgCardVar?: string
  hoverBgVar?: string
  textColorVar?: string
}

export function InnerMoonToggle({
  toggled,
  onToggle,
  size = 18,
  borderColorVar = 'var(--ap-border)',
  bgCardVar = 'var(--ap-bg-card)',
  hoverBgVar = 'var(--ap-hover-bg)',
  textColorVar = 'var(--ap-text-secondary)',
}: InnerMoonToggleProps) {
  const [hover, setHover] = useState(false)

  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={toggled ? 'Đổi sang giao diện Sáng' : 'Đổi sang giao diện Tối'}
      aria-label="Toggle theme"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        borderRadius: 6,
        border: `1px solid ${borderColorVar}`,
        background: hover ? hoverBgVar : bgCardVar,
        color: textColorVar,
        cursor: 'pointer',
        transition: 'all 180ms ease-in-out',
        padding: 0,
        outline: 'none',
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        aria-hidden="true"
        fill="currentColor"
        style={{
          transition: 'transform 500ms cubic-bezier(0, 0, 0.15, 1.25)',
          transform: toggled ? 'rotate(180deg)' : 'rotate(0deg)',
          display: 'block',
        }}
      >
        <path
          d="M27.5 11.5v-7h-7L16 0l-4.5 4.5h-7v7L0 16l4.5 4.5v7h7L16 32l4.5-4.5h7v-7L32 16l-4.5-4.5zM16 25.4a9.39 9.39 0 1 1 0-18.8 9.39 9.39 0 1 1 0 18.8z"
          style={{
            transformOrigin: 'center',
            transition: 'transform 500ms cubic-bezier(0, 0, 0.15, 1.25)',
          }}
        />
        <circle
          cx={16}
          cy={16}
          r={7.6}
          style={{
            transformOrigin: 'center',
            transition: 'transform 333ms cubic-bezier(0.4, 0, 0.2, 1)',
            transform: toggled ? 'translateX(4px)' : 'translateX(0)',
          }}
        />
      </svg>
    </button>
  )
}

export default InnerMoonToggle
