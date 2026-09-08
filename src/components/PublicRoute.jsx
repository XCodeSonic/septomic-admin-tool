import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import api from '@/api/axios'
import { clearSessionExpired } from '@/lib/auth'

// Inverse of PrivateRoute — if the person already has a *valid* session,
// keep them out of the login screen and send them to the dashboard.
export default function PublicRoute({ children }) {
  const token = localStorage.getItem('token')
  const [status, setStatus] = useState(token ? 'checking' : 'none')

  useEffect(() => {
    if (!token) return
    api.get('/auth/verify.php')
      .then(res => {
        if (!res.data.success) {
          clearSessionExpired()
          setStatus('invalid')
        } else {
          setStatus('valid')
        }
      })
      .catch(() => setStatus('invalid')) // can't confirm it's valid — safest is to show login
  }, [token])

  if (!token || status === 'invalid') return children // show login
  if (status === 'checking') return null
  return <Navigate to="/dashboard" replace /> // status === 'valid'
}