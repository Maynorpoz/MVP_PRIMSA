import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/Button'
import { useAuth } from '@/features/auth/AuthContext'

export function UnauthorizedPage() {
  const navigate = useNavigate()
  const { role } = useAuth()

  const homePath = role === 'sales_admin_role' ? '/admin' : '/catalog'

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-100 p-8">
      <EmptyState
        icon={
          <svg
            width={30}
            height={30}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
          </svg>
        }
        title="No autorizado"
        description="Tu cuenta no tiene permisos para ver esta sección."
        action={
          <Button onClick={() => navigate(homePath, { replace: true })}>Volver al inicio</Button>
        }
      />
    </div>
  )
}
