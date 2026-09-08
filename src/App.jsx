import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import GenerateEP from '@/pages/GenerateEP'
import Settings from '@/pages/Settings'
import EPCardTheme from '@/pages/EPCardTheme'
import PrivateRoute from '@/components/PrivateRoute'
import PublicRoute from '@/components/PublicRoute'
import AppLayout from '@/components/layout/AppLayout'
import './index.css'

export default function App() {
  return (
    <HashRouter>  {/* Changed from BrowserRouter */}
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generate-ep" element={<GenerateEP />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/ep-theme" element={<EPCardTheme />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </HashRouter>
  )
}