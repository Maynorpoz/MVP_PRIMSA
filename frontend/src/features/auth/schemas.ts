import { z } from 'zod'

/**
 * Zod is UX only here — the backend re-validates and is the real authority
 * (see ARQUITECTURA.md section 8). Neither schema has a `role` field: the
 * register form must never offer one (see section 4).
 */

export const loginSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio').email('Ingresa un correo válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    email: z.string().min(1, 'El correo es obligatorio').email('Ingresa un correo válido'),
    password: z.string().min(8, 'Debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
