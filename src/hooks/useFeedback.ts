import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const APP_NAME = 'Mi Armario'
const APP_VERSION = '0.2.0'

const TYPE_LABELS: Record<string, string> = {
  suggestion: 'Sugerencia',
  bug: 'Bug',
  other: 'Feedback',
}

export interface FeedbackPayload {
  type: 'suggestion' | 'bug' | 'other'
  message: string
  email?: string
}

export function useSubmitFeedback() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ type, message, email }: FeedbackPayload) => {
      if (!message?.trim()) throw new Error('El mensaje es obligatorio')

      const trimmed = message.trim()
      const replyEmail = email?.trim() || user?.email || null
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null

      // 1. Guardar en Supabase (siempre)
      const { data: row, error } = await supabase
        .from('feedback')
        .insert({
          user_id: user?.id ?? null,
          type,
          message: trimmed,
          email: replyEmail,
          user_agent: userAgent,
          app_version: APP_VERSION,
        })
        .select()
        .single()

      if (error) throw error

      // 2. Enviar por email via Web3Forms (best-effort)
      let emailSent = false
      let emailError: string | null = null

      if (!WEB3FORMS_KEY) {
        emailError = 'No hay VITE_WEB3FORMS_KEY configurada'
      } else {
        try {
          const typeLabel = TYPE_LABELS[type]
          const bodyText = [
            `Tipo: ${typeLabel}`,
            `Usuario: ${user?.email ?? 'anónimo'}`,
            replyEmail ? `Responder a: ${replyEmail}` : null,
            '',
            'Mensaje:',
            trimmed,
            '',
            '---',
            `User Agent: ${userAgent ?? 'n/a'}`,
            `Feedback ID: ${row?.id ?? 'n/a'}`,
          ]
            .filter(Boolean)
            .join('\n')

          const res = await fetch(WEB3FORMS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              access_key: WEB3FORMS_KEY,
              subject: `[${APP_NAME}] ${typeLabel}`,
              from_name: `${APP_NAME} — ${typeLabel}`,
              email: replyEmail || `noreply@miarmario.app`,
              message: bodyText,
              botcheck: '',
            }),
          })
          const json = await res.json().catch(() => ({}))
          emailSent = res.ok && json.success
          if (!emailSent) emailError = json.message ?? `HTTP ${res.status}`
        } catch (err: any) {
          emailError = err?.message ?? 'Error de red'
        }
      }

      return { row, emailSent, emailError }
    },
  })
}
