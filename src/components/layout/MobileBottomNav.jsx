import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Sparkles, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { to: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/generate-ep', label: 'Generate EP', icon: Sparkles },
]

export default function MobileBottomNav() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'Admin'
  const [profileOpen, setProfileOpen] = useState(false)

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <>
      {/* Floating pill nav — fixed to viewport, safe-area aware */}
      <nav
        className="fixed inset-x-0 z-50 flex justify-center md:hidden"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
      >
        <div className="flex items-center gap-1 rounded-full bg-[#141414]/95 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl ring-1 ring-white/10">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex h-12 items-center gap-2 rounded-full px-4 text-[13px] font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white text-[#141414]'
                    : 'text-white/60 hover:text-white/90'
                )
              }
            >
              <item.icon className="size-[19px] shrink-0" strokeWidth={1.9} />
            </NavLink>
          ))}

          {/* Profile / account */}
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-[13px] font-semibold text-white transition-colors hover:bg-white/20"
          >
            {username.charAt(0).toUpperCase()}
          </button>
        </div>
      </nav>

      {/* Profile sheet */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="size-5 text-[#0071e3]" />
              Account
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-[13px] font-semibold text-background">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-medium text-foreground">{username}</p>
              <p className="text-[12px] text-muted-foreground">Administrator</p>
            </div>
          </div>
          <Button
            variant="destructive"
            className="w-full justify-center"
            onClick={logout}
          >
            <LogOut className="mr-1.5 size-4" /> Log out
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
