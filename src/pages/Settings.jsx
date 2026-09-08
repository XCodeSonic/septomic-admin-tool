import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Image as ImageIcon, LogOut, ChevronRight, Fingerprint } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import { clearSessionManual } from '@/lib/auth'
import {
  isBiometricSupported,
  isBiometricEnabled,
  enableBiometric,
  disableBiometric,
} from '@/lib/biometric'

export default function Settings() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'Admin'
  const [bioSupported, setBioSupported] = useState(false)
  const [bioEnabled, setBioEnabled] = useState(isBiometricEnabled())
  const [bioError, setBioError] = useState('')

  useEffect(() => {
    isBiometricSupported().then(setBioSupported)
  }, [])

  const toggleBiometric = async () => {
    setBioError('')
    if (bioEnabled) {
      disableBiometric()
      setBioEnabled(false)
      return
    }
    try {
      await enableBiometric(username)
      setBioEnabled(true)
    } catch {
      setBioError('Could not set up Face ID / fingerprint on this device.')
    }
  }

  const logout = () => {
    clearSessionManual()
    navigate('/login')
  }

  return (
    <div className="mx-auto max-w-2xl pb-28 md:pb-10">
      <PageHeader title="Settings" description="Manage EP card appearance and your account." />

      <div className="space-y-4 px-4 sm:px-6 md:px-8">
        <Card>
          <CardContent className="p-0">
            <button
              type="button"
              onClick={() => navigate('/settings/ep-theme')}
              className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0071e3]/10 text-[#0071e3]">
                <ImageIcon className="size-[18px]" strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-foreground">EP Card Theme</p>
                <p className="text-[12px] text-muted-foreground">Upload and manage card designs</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground/60" />
            </button>
          </CardContent>
        </Card>

        {bioSupported && (
          <Card>
            <CardContent className="space-y-2">
              <button
                type="button"
                onClick={toggleBiometric}
                className="flex w-full items-center gap-3 text-left"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0071e3]/10 text-[#0071e3]">
                  <Fingerprint className="size-[18px]" strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-foreground">Face ID / Fingerprint unlock</p>
                  <p className="text-[12px] text-muted-foreground">
                    {bioEnabled ? 'Enabled — tap to turn off' : 'Skip typing your password next time'}
                  </p>
                </div>
                <div className={`h-6 w-10 shrink-0 rounded-full transition-colors ${bioEnabled ? 'bg-[#0071e3]' : 'bg-muted'}`}>
                  <div className={`m-0.5 size-5 rounded-full bg-white shadow transition-transform ${bioEnabled ? 'translate-x-4' : ''}`} />
                </div>
              </button>
              {bioError && <p className="text-[12px] text-destructive">{bioError}</p>}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-[13px] font-semibold text-muted-foreground">
                {username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[13px] font-medium text-foreground">{username}</p>
                <p className="text-[12px] text-muted-foreground">Administrator</p>
              </div>
            </div>
            <Button variant="destructive" className="w-full justify-center" onClick={logout}>
              <LogOut className="mr-1.5 size-4" /> Log out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}