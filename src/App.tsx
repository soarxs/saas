import { Routes, Route } from 'react-router-dom'
import { TableProvider } from './contexts/TableContext'
import { ShiftProvider } from './contexts/ShiftContext'
import { BalcaoProvider } from './contexts/BalcaoContext'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { AdminPanel } from './pages/AdminPanel'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'
import { BalcaoView } from './pages/BalcaoView'
import { NeighborhoodsConfig } from './pages/NeighborhoodsConfig'
import { PrintConfig } from './pages/PrintConfig'

function App() {
  return (
    <TableProvider>
      <ShiftProvider>
        <BalcaoProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="admin" element={<AdminPanel />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="balcao" element={<BalcaoView />} />
              <Route path="neighborhoods" element={<NeighborhoodsConfig />} />
              <Route path="print-config" element={<PrintConfig />} />
            </Route>
          </Routes>
        </BalcaoProvider>
      </ShiftProvider>
    </TableProvider>
  )
}

export default App
