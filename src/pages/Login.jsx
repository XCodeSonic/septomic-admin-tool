import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/api/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// utils/token.php embeds { user_id, username, role } in the JWT payload
// (base64, not encrypted) — login.php itself never returns a userNum field,
// so we have to pull it out of the token instead.
function decodeTokenPayload(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export default function Login() {
  const [form, setForm]       = useState({ username: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login.php', form)
      if (res.data.success) {
        if (String(res.data.role) !== '30') {
          setError('Access denied. Admins only.')
          return
        }
        localStorage.setItem('token',    res.data.token)
        localStorage.setItem('username', res.data.username)
        const decoded = decodeTokenPayload(res.data.token)
        if (decoded?.user_id) localStorage.setItem('userNum', decoded.user_id)
        navigate('/dashboard')
      } else {
        setError(res.data.message || 'Login failed.')
      }
    } catch (err) {
      // Surface the actual server message if available
      const msg = err?.response?.data?.message
      setError(msg || 'Connection error. Check server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Very subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white pointer-events-none" />

      <div className="relative z-10 w-full max-w-[360px] px-4">
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-[18px] bg-black flex items-center justify-center text-2xl font-bold text-white mb-4"
            style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
            S
          </div>
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-[-0.3px]">Septomic Admin</h1>
          <p className="text-sm text-gray-400 mt-1">Administrator access only</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm shadow-black/[0.04] p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.06em]">
                Username
              </label>
              <Input
                className="h-10 rounded-lg bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-300 text-sm focus-visible:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Enter username"
                value={form.username}
                autoComplete="username"
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.06em]">
                Password
              </label>
              <Input
                className="h-10 rounded-lg bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-300 text-sm focus-visible:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                type="password"
                placeholder="Enter password"
                value={form.password}
                autoComplete="current-password"
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-3.5 py-2.5 text-[13px] text-red-500">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 bg-black hover:bg-gray-900 active:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors mt-1"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-gray-300 mt-6">
          Septomic © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}