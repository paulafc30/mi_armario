import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cx } from '@/lib/utils'

/**
 * Input de contraseña con icono de ojito para alternar mostrar / ocultar.
 * Hereda los estilos de la clase `.input` y reserva padding a la derecha
 * para que el toggle no se solape con el texto.
 *
 * El botón usa `tabIndex={-1}` para no romper el orden de tabulación del
 * formulario (la usuaria que tabula del input al siguiente campo no
 * pasa por el ojito).
 */
type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>

const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput(
  { className, ...props },
  ref
) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={cx('input pr-11', className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        title={visible ? 'Ocultar' : 'Mostrar'}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted hover:text-ink hover:bg-surface-soft transition"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
})

export default PasswordInput
