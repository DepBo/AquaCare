import './InnerMoonToggle.css'

interface InnerMoonToggleProps {
  toggled?: boolean
  dark?: boolean
  onToggle: () => void
  size?: number
  borderColorVar?: string
  bgCardVar?: string
  hoverBgVar?: string
  textColorVar?: string
}

export function InnerMoonToggle({
  toggled,
  dark,
  onToggle,
  size = 18,
  borderColorVar,
  bgCardVar,
  hoverBgVar,
  textColorVar,
}: InnerMoonToggleProps) {
  const isDark = dark ?? toggled ?? false
  const label = isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'

  return (
    <button
      type="button"
      className={`inner-moon-toggle ${isDark ? 'is-dark' : 'is-light'}`}
      onClick={onToggle}
      title={label}
      aria-label={label}
      aria-pressed={isDark}
      style={{
        borderColor: borderColorVar,
        background: bgCardVar,
        color: textColorVar,
        '--inner-moon-hover-bg': hoverBgVar,
      } as React.CSSProperties}
    >
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" fill="currentColor">
        <path
          className="inner-moon-rays"
          d="M27.5 11.5v-7h-7L16 0l-4.5 4.5h-7v7L0 16l4.5 4.5v7h7L16 32l4.5-4.5h7v-7L32 16l-4.5-4.5zM16 25.4a9.39 9.39 0 1 1 0-18.8 9.39 9.39 0 1 1 0 18.8z"
        />
        <circle className="inner-moon-core" cx="16" cy="16" r="7.6" />
      </svg>
    </button>
  )
}

export default InnerMoonToggle
