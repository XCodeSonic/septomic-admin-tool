import { useState } from 'react'
import { Fingerprint, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { unlockWithBiometric } from '@/lib/biometric'
import { clearSessionManual } from '@/lib/auth'
import { useNavigate } from 'react-router-dom'

export default function BiometricLock({ onUnlock }) {
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const navigate = useNavigate()

  const tryUnlock = async () => {
    setChecking(true)
    setError('')
    const ok = await unlockWithBiometric()
    setChecking(false)
    if (ok) {
      sessionStorage.setItem('biometricUnlocked', '1')
      onUnlock()
    } else {
      setError('Could not verify. Try again.')
    }
  }

  const logout = () => {
    clearSessionManual()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-white px-6">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Fingerprint className="size-8 text-[#0071e3]" strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-medium text-foreground">Unlock Septomic Admin</p>
        <p className="mt-1 text-[13px] text-muted-foreground">Use Face ID, Touch ID, or fingerprint to continue</p>
      </div>
      {error && <p className="text-[13px] text-destructive">{error}</p>}
      <Button onClick={tryUnlock} disabled={checking} className="w-full max-w-[240px]">
        {checking ? 'Verifying…' : 'Unlock'}
      </Button>
      <button
        type="button"
        onClick={logout}
        className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
      >
        <LogOut className="size-3.5" /> Log out instead
      </button>
    </div>
  )
}