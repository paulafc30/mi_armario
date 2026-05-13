/**
 * Iconos sencillos para indicar visualmente las plataformas de venta de
 * segunda mano dentro de la app. NO son los logos oficiales — son glifos
 * simplificados (cuadrado redondeado + trazo de letra) que actúan como
 * pista visual para el toggle de presencia en cada plataforma.
 *
 * `currentColor` se aplica al fondo del cuadrado, así puedes controlar
 * el color desde Tailwind con clases como `text-[#13C1AC]`.
 */

export const WALLAPOP_COLOR = '#13C1AC'
export const VINTED_COLOR   = '#007782'

interface IconProps {
  className?: string
  style?: React.CSSProperties
}

export function WallapopIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-label="Wallapop">
      <rect width="24" height="24" rx="6" fill="currentColor" />
      <path
        d="M5.5 9 L8 15.5 L10.5 11 L12 14.5 L13.5 11 L16 15.5 L18.5 9"
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function VintedIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-label="Vinted">
      <rect width="24" height="24" rx="6" fill="currentColor" />
      <path
        d="M7 8 L12 16.5 L17 8"
        fill="none"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
