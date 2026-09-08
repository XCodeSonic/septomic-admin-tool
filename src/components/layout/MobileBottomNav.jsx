import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Sparkles, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/generate-ep', label: 'Generate EP', icon: Sparkles },
  { to: '/settings',    label: 'Settings',    icon: Settings },
]

export default function MobileBottomNav() {
  return (
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
      </div>
    </nav>
  )
}