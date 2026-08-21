import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { toUserMessage } from '@/lib/errors'
import { useAuth } from './AuthContext'
import { BrandPanel } from './BrandPanel'
import { loginSchema } from './schemas'
import type { LoginFormValues } from './schemas'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError(null)
    try {
      // Use the role returned by login(), not the context's `role` — that
      // value is still whatever this render started with, since setState
      // hasn't re-rendered this closure yet.
      const role = await login(email, password)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? (role === 'sales_admin_role' ? '/admin' : '/catalog'), { replace: true })
    } catch (error) {
      setFormError(toUserMessage(error, 'Correo o contraseña incorrectos.'))
    }
  })

  return (
    <div className="flex min-h-screen bg-paper-50">
      <BrandPanel
        headline="Piezas esenciales, hechas para durar."
        body="Catálogo curado, stock real y despacho el mismo día. Inicia sesión para continuar tu pedido."
      />

      <div className="flex flex-1 items-center justify-center p-12">
        <div className="flex w-full max-w-[360px] flex-col gap-7">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-ink-950">Iniciar sesión</h2>
            <p className="text-sm text-ink-700">Accede a tu cuenta de Primsa.</p>
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
              {...register('email')}
            />
            <Input
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
              Iniciar sesión
            </Button>
          </form>

          <p className="text-center text-sm text-ink-700">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-semibold text-brand-hover hover:underline">
              Crear una
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
