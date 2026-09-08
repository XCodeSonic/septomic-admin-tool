import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Sparkles, Settings as SettingsIcon, LogOut, PanelLeftClose, PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

// Add new sections/items here as the tool grows.
const NAV_ITEMS = [
  { to: '/dashboard',    label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/generate-ep',  label: 'Generate EP', icon: Sparkles },
  { to: '/settings',     label: 'Settings',    icon: SettingsIcon },
]

export default function AppSidebar() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'Admin'
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === '1')

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0')
  }, [collapsed])

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <aside
      className={cn(
        'hidden h-screen shrink-0 flex-col border-r border-border bg-sidebar/70 backdrop-blur-xl transition-[width] duration-200 ease-out md:flex',
        collapsed ? 'w-[68px]' : 'w-60'
      )}
    >
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-foreground text-[13px] font-semibold text-background">
          S
        </div>
        {!collapsed && (
          <span className="font-heading truncate text-[15px] font-semibold tracking-tight text-foreground">
            Septomic
          </span>
        )}
      </div>

      <div className="mx-4 h-px shrink-0 bg-border" />

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-[#0071e3]/10 text-[#0071e3]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon className="size-[18px] shrink-0" strokeWidth={1.75} />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="shrink-0 space-y-0.5 border-t border-border px-3 py-3">
        <div className={cn('flex h-9 items-center gap-2.5 rounded-lg px-3', collapsed && 'justify-center px-0')}>
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
            {username.charAt(0).toUpperCase()}
          </div>
          {!collapsed && <span className="truncate text-[13px] font-medium text-foreground">{username}</span>}
        </div>
        <button
          type="button"
          onClick={logout}
          title={collapsed ? 'Log out' : undefined}
          className={cn(
            'flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut className="size-[18px] shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="flex h-10 shrink-0 items-center justify-center border-t border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {collapsed ? <PanelLeft className="size-4" strokeWidth={1.75} /> : <PanelLeftClose className="size-4" strokeWidth={1.75} />}
      </button>
    </aside>
  )
}
