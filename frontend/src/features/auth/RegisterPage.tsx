import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { toUserMessage } from '@/lib/errors'
import { register as registerRequest } from '@/api/auth'
import { BrandPanel } from './BrandPanel'
import { registerSchema } from './schemas'
import type { RegisterFormValues } from './schemas'

export function RegisterPage() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError(null)
    try {
      // The backend never accepts (or needs) a role here — every public
      // registration is a customer_role account. See INSTRUCCIONES.md
      // section 4: adding a role field to this form would be rejected
      // server-side and must never be offered client-side either.
      await registerRequest({ email, password })
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (error) {
      setFormError(toUserMessage(error, 'No pudimos crear tu cuenta. Intenta de nuevo.'))
    }
  })

  return (
    <div className="flex min-h-screen bg-paper-50">
      <BrandPanel
        headline="Tu garaje, mejor equipado."
        body="Crea tu cuenta para guardar tu carrito, revisar tus pedidos y comprar más rápido la próxima vez."
      />

      <div className="flex flex-1 items-center justify-center p-10">
        <div className="flex w-full max-w-[360px] flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-ink-950">Crear cuenta</h2>
            <p className="text-sm text-ink-700">Solo necesitas tu correo y una contraseña.</p>
          </div>

          {formError && (
            <div
              role="alert"
              className="rounded-sm border border-danger/25 bg-danger-tint px-3.5 py-3 text-sm text-ink-950"
            >
              {formError}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
            <Input
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              placeholder="tucorreo@ejemplo.com"
              error={errors.email?.message}
              {...registerField('email')}
            />
            <Input
              label="Contraseña"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              error={errors.password?.message}
              {...registerField('password')}
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              error={errors.confirmPassword?.message}
              {...registerField('confirmPassword')}
            />
            <p className="-mt-1 text-xs leading-relaxed text-ink-400">
              Tu cuenta se crea con acceso de cliente. No se solicita ni se asigna ningún otro tipo
              de rol desde este formulario.
            </p>
            <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
              Crear cuenta
            </Button>
          </form>

          <p className="text-center text-sm text-ink-700">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-brand-hover hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
