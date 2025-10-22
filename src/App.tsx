import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TableProvider } from './contexts/TableContext'
import { ShiftProvider } from './contexts/ShiftContext'
import { BalcaoProvider } from './contexts/BalcaoContext'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { AdminPanel } from './pages/AdminPanel'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'
import { BalcaoView } from './pages/BalcaoView'
import { NeighborhoodsConfig } from './pages/NeighborhoodsConfig'
import { PrintConfig } from './pages/PrintConfig'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <TableProvider>
        <ShiftProvider>
          <BalcaoProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="admin" element={
                  <ProtectedRoute requiredRole="ceo">
                    <AdminPanel />
                  </ProtectedRoute>
                } />
                <Route path="reports" element={
                  <ProtectedRoute requiredRole="ceo">
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="settings" element={
                  <ProtectedRoute requiredRole="admin">
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="balcao" element={<BalcaoView />} />
                <Route path="neighborhoods" element={
                  <ProtectedRoute requiredRole="admin">
                    <NeighborhoodsConfig />
                  </ProtectedRoute>
                } />
                <Route path="print-config" element={
                  <ProtectedRoute requiredRole="admin">
                    <PrintConfig />
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
          </BalcaoProvider>
        </ShiftProvider>
      </TableProvider>
    </AuthProvider>
  )
}

export default App
