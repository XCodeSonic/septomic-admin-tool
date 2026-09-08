import { Outlet } from 'react-router-dom'
import AppSidebar from './AppSidebar'
import MobileBottomNav from './MobileBottomNav'

export default function AppLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto pb-28 md:pb-0">
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  )
}
