import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toast } from '@heroui/react'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { useAuth } from './context/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import StorePage from './pages/StorePage'
import GameDetailPage from './pages/GameDetailPage'
import LibraryPage from './pages/LibraryPage'
import CartPage from './pages/CartPage'
import DashboardPage from './pages/DashboardPage'
import WishlistPage from './pages/WishlistPage'

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/store" replace />
  }

  return <>{children}</>
}

function HomeRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/store" replace />
  }

  return <HomePage />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route element={<AppLayout />}>
        <Route path="/store" element={<StorePage />} />
        <Route path="/store/:gameId" element={<GameDetailPage />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <LibraryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function AppInner() {
  const { isAuthenticated } = useAuth()

  return (
    <CartProvider key={String(isAuthenticated)}>
      <AppRoutes />
    </CartProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toast.Provider />
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
