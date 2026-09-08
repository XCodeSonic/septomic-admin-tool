import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import api from '@/api/axios'
import { clearSessionExpired } from '@/lib/auth'
import { isBiometricEnabled } from '@/lib/biometric'
import BiometricLock from './BiometricLock'

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  const [status, setStatus] = useState(token ? 'checking' : 'none')
  const [unlocked, setUnlocked] = useState(sessionStorage.getItem('biometricUnlocked') === '1')

  useEffect(() => {
    if (!token) return
    api.get('/auth/verify.php')
      .then(res => {
        setStatus(res.data.success ? 'valid' : 'invalid')
        if (!res.data.success) clearSessionExpired()
      })
      .catch(() => {
        // Network/server error — don't punish the user for a flaky
        // connection; let them through and normal API calls will fail
        // loudly if the token really is bad.
        setStatus('valid')
      })
  }, [token])

  if (!token) return <Navigate to="/login" replace />
  if (status === 'checking') return null // instant, no loading flicker needed in practice
  if (status === 'invalid') return <Navigate to="/login" replace />
  if (isBiometricEnabled() && !unlocked) {
    return <BiometricLock onUnlock={() => setUnlocked(true)} />
  }
  return children
}