/**
 * Logo de la app: una percha estilizada al estilo de lucide-react.
 * Usa `currentColor` para que el color se pueda controlar desde Tailwind.
 */
export default function HangerIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Hook (anilla superior) */}
      <circle cx="12" cy="5" r="1.6" />
      {/* Cuello / stem */}
      <path d="M12 6.6 V10.5" />
      {/* Hombros triangulares */}
      <path d="M3.5 18 L12 10.5 L20.5 18" />
      {/* Barra horizontal inferior */}
      <path d="M3 18 H21" />
    </svg>
  )
}
