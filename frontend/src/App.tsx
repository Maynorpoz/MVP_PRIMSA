import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/core/queryClient'
import { AuthProvider } from '@/features/auth/AuthContext'
import { CartProvider } from '@/features/checkout/CartContext'
import { ToastProvider } from '@/components/ToastProvider'
import { AppRoutes } from '@/routes/AppRoutes'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
