import { useState } from 'react'

/**
 * Iconos de las plataformas de venta. Carga el logo oficial desde
 * Simple Icons CDN (https://simpleicons.org), que es un repositorio
 * público gratuito de iconos de marcas. Si el CDN no responde por la
 * razón que sea, mostramos un glifo de respaldo (cuadrado + trazo).
 *
 * Los logos se utilizan únicamente como indicador visual de que la
 * prenda está publicada en esa plataforma — no se reproducen ni
 * almacenan en el repositorio.
 */

export const WALLAPOP_COLOR = '#13C1AC'
export const VINTED_COLOR   = '#007782'

interface IconProps {
  className?: string
}

function BrandIcon({
  slug,
  label,
  brandColor,
  fallbackPath,
  className,
}: {
  slug: string
  label: string
  brandColor: string
  fallbackPath: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-label={label} style={{ color: brandColor }}>
        <rect width="24" height="24" rx="6" fill="currentColor" />
        <path
          d={fallbackPath}
          fill="none"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <img
      src={`https://cdn.simpleicons.org/${slug}`}
      alt={label}
      width={24}
      height={24}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  )
}

export function WallapopIcon(props: IconProps) {
  return (
    <BrandIcon
      slug="wallapop"
      label="Wallapop"
      brandColor={WALLAPOP_COLOR}
      fallbackPath="M5.5 9 L8 15.5 L10.5 11 L12 14.5 L13.5 11 L16 15.5 L18.5 9"
      {...props}
    />
  )
}

export function VintedIcon(props: IconProps) {
  return (
    <BrandIcon
      slug="vinted"
      label="Vinted"
      brandColor={VINTED_COLOR}
      fallbackPath="M7 8 L12 16.5 L17 8"
      {...props}
    />
  )
}
