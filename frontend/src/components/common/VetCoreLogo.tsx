interface Props {
  size?: number
  showText?: boolean
  light?: boolean
}

export default function VetCoreLogo({ size = 32, showText = true, light = false }: Props) {
  const textSize = Math.round(size * 0.56)

  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer shield */}
        <path
          d="M22 3L5 10.5V22C5 31.8 12.5 40.4 22 42.5C31.5 40.4 39 31.8 39 22V10.5L22 3Z"
          fill={light ? 'rgba(255,255,255,0.15)' : '#0f766e'}
          stroke={light ? 'rgba(255,255,255,0.3)' : '#0d6660'}
          strokeWidth="0.5"
        />
        {/* Inner shield highlight */}
        <path
          d="M22 8L9 14.5V22C9 30 15.2 37 22 38.9C28.8 37 35 30 35 22V14.5L22 8Z"
          fill={light ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.10)'}
        />
        {/* Cross — vertical */}
        <rect
          x="19.5" y="12" width="5" height="20" rx="2.5"
          fill={light ? 'rgba(255,255,255,0.9)' : 'white'}
        />
        {/* Cross — horizontal */}
        <rect
          x="12" y="19.5" width="20" height="5" rx="2.5"
          fill={light ? 'rgba(255,255,255,0.9)' : 'white'}
        />
        {/* Paw dots — four small circles in corners of cross */}
        <circle cx="13.5" cy="13.5" r="2"
          fill={light ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.22)'}
        />
        <circle cx="30.5" cy="13.5" r="2"
          fill={light ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.22)'}
        />
      </svg>

      {showText && (
        <div className="flex items-baseline leading-none">
          <span
            className={`font-extrabold tracking-tight ${
              light ? 'text-white' : 'text-warm-800'
            }`}
            style={{ fontSize: textSize }}
          >
            Vet
          </span>
          <span
            className={`font-extrabold tracking-tight ${
              light ? 'text-amber-300' : 'text-gold-600'
            }`}
            style={{ fontSize: textSize }}
          >
            Core
          </span>
        </div>
      )}
    </div>
  )
}
