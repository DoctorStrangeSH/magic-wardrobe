import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import StoriesList from './components/stories/StoriesList'
import WardrobePage from './components/wardrobe/WardrobePage'
import DashboardPage from './components/dashboard/DashboardPage'
import SettingsPage from './components/settings/SettingsPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<StoriesList />} />
        <Route path="/story/:storyId" element={<WardrobePage />} />
        <Route path="/stats" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App