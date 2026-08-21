import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { InventoryPage } from '@/features/catalog/InventoryPage'
import { CheckoutPage } from '@/features/checkout/CheckoutPage'
import { DailyOrdersPage } from '@/features/management/DailyOrdersPage'
import { ProtectedRoute } from './ProtectedRoute'
import { UnauthorizedPage } from './UnauthorizedPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/catalog" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/catalog" element={<InventoryPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute allowedRoles={['customer_role']} />}>
        <Route path="/checkout" element={<CheckoutPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['sales_admin_role']} />}>
        <Route path="/admin" element={<DailyOrdersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/catalog" replace />} />
    </Routes>
  )
}
