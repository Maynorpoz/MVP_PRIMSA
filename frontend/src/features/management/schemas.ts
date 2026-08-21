import { z } from 'zod'

export const createAdminSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio').email('Ingresa un correo válido'),
  password: z.string().min(8, 'Debe tener al menos 8 caracteres'),
})

export type CreateAdminFormValues = z.infer<typeof createAdminSchema>
