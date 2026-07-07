import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { AppShell } from '@/components/AppShell'
import { Login } from '@/pages/Login'
import { ChatPage } from '@/pages/Chat'
import { MemoryPage } from '@/pages/Memory'
import { ConnectorsPage } from '@/pages/Connectors'
import { InsightsPage } from '@/pages/Insights'
import { SearchPage } from '@/pages/Search'
import { SettingsPage } from '@/pages/Settings'
import { WorkspacePage } from '@/pages/Workspace'
import { Mark } from '@/icons'

function Booting() {
  return (
    <div className="flex h-screen items-center justify-center bg-paper">
      <span className="flex h-11 w-11 items-center justify-center rounded-[11px] bg-evergreen text-veil consolidating">
        <Mark size={26} />
      </span>
    </div>
  )
}

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Booting />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <AppShell>{children}</AppShell>
}

export function App() {
  const { user, loading } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={loading ? <Booting /> : user ? <Navigate to="/memory" replace /> : <Login />}
      />
      <Route path="/chat" element={<Protected><ChatPage /></Protected>} />
      <Route path="/memory" element={<Protected><MemoryPage /></Protected>} />
      <Route path="/connectors" element={<Protected><ConnectorsPage /></Protected>} />
      <Route path="/insights" element={<Protected><InsightsPage /></Protected>} />
      <Route path="/search" element={<Protected><SearchPage /></Protected>} />
      <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
      <Route path="/workspace" element={<Protected><WorkspacePage /></Protected>} />
      <Route path="*" element={<Navigate to={user ? '/memory' : '/login'} replace />} />
    </Routes>
  )
}
