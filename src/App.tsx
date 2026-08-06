import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import StoriesList from './components/stories/StoriesList'
import WardrobePage from './components/wardrobe/WardrobePage'
import DashboardPage from './components/dashboard/DashboardPage'
import SettingsPage from './components/settings/SettingsPage'
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
import AuthGuard from './components/auth/AuthGuard'

function App() {
  return (
    <Routes>
      {/* Публичные страницы */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Защищённые страницы */}
      <Route element={
        <AuthGuard>
          <AppLayout />
        </AuthGuard>
      }>
        <Route path="/" element={<StoriesList />} />
        <Route path="/story/:storyId" element={<WardrobePage />} />
        <Route path="/stats" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App