import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import GenerateEP from '@/pages/GenerateEP'
import PrivateRoute from '@/components/PrivateRoute'
import AppLayout from '@/components/layout/AppLayout'
import './index.css'

export default function App() {
  return (
    <HashRouter>  {/* Changed from BrowserRouter */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generate-ep" element={<GenerateEP />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </HashRouter>
  )
}