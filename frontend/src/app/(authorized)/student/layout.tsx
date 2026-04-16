'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { studentNavigation } from '@/lib/navigation'
import { useSidebarContext } from '../layout'
import { cn } from '@/lib/utils'
import { getSidebarUser } from '@/lib/auth/sidebar-user'

/** Learning detail: full-screen without sidebar */
function isStudentFullScreenRoute(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  // /student/learning/[courseUid]
  if (segments[0] === 'student' && segments[1] === 'learning' && segments.length >= 3) return true
  return false
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = getSidebarUser()
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, isMinimized, close, toggleMinimize } = useSidebarContext()
  const hideSidebar = isStudentFullScreenRoute(pathname)

  return (
    <div className="min-h-screen w-full bg-[#f5f5f5]">
      {!hideSidebar && (
        <Sidebar
          navigation={studentNavigation}
          isOpen={isOpen}
          onClose={close}
          isMinimized={isMinimized}
          onToggleMinimize={toggleMinimize}
          user={user}
          onLogout={() => {
            router.push('/auth/login')
          }}
          onProfile={() => {
            router.push('/profile')
          }}
        />
      )}

      <div
        className={cn(
          'flex flex-col flex-1 transition-all duration-300 ease-in-out',
          !hideSidebar && (isMinimized ? 'lg:ml-20' : 'lg:ml-64')
        )}>
        <main className={cn('flex-1', hideSidebar ? 'p-4 sm:p-6 lg:p-8' : 'p-6')}>{children}</main>
      </div>
    </div>
  )
}
