import { Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from './components/layout/AppShell'
import { CodexPage } from './pages/CodexPage'
import { DockerDetailPage } from './pages/DockerDetailPage'
import { DockerPage } from './pages/DockerPage'
import { MinecraftPage } from './pages/MinecraftPage'
import { MonitoringPage } from './pages/MonitoringPage'
import { NetworkPage } from './pages/NetworkPage'
import { OverviewPage } from './pages/OverviewPage'
import { SettingsPage } from './pages/SettingsPage'
import { SystemPage } from './pages/SystemPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/monitoring" element={<MonitoringPage />} />
        <Route path="/docker" element={<DockerPage />} />
        <Route path="/docker/:id" element={<DockerDetailPage />} />
        <Route path="/minecraft" element={<MinecraftPage />} />
        <Route path="/codex" element={<CodexPage />} />
        <Route path="/network" element={<NetworkPage />} />
        <Route path="/system" element={<SystemPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
