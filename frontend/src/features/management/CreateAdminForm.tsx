import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { createAdmin } from '@/api/auth'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { useToast } from '@/components/ToastProvider'
import { toUserMessage } from '@/lib/errors'
import { createAdminSchema } from './schemas'
import type { CreateAdminFormValues } from './schemas'

export function CreateAdminForm() {
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAdminFormValues>({ resolver: zodResolver(createAdminSchema) })

  const mutation = useMutation({
    mutationFn: createAdmin,
    onSuccess: (created) => {
      showToast(`Administrador ${created.email} creado.`, 'success')
      reset()
    },
    onError: (error) => {
      showToast(toUserMessage(error, 'No pudimos crear el administrador.'), 'error')
    },
  })

  const onSubmit = handleSubmit((values) => mutation.mutate(values))

  return (
    <div className="flex h-fit w-80 shrink-0 flex-col gap-4 rounded-md border border-paper-200 bg-paper-50 p-6">
      <div>
        <h2 className="text-base font-semibold">Crear administrador</h2>
        <p className="text-[12.5px] leading-relaxed text-ink-700">
          Otorga acceso de administración a un nuevo correo.
        </p>
      </div>
      <form className="flex flex-col gap-3.5" onSubmit={onSubmit} noValidate>
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="nuevo.admin@primsa.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Contraseña temporal"
          type="password"
          placeholder="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" isLoading={mutation.isPending} className="mt-1 w-full">
          Crear administrador
        </Button>
      </form>
    </div>
  )
}
