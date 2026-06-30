'use client'

import { useState } from 'react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
      <div className="flex min-h-screen bg-background">
        {/* Desktop sidebar — always visible ≥1024px */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:shrink-0">
          <div className="fixed inset-y-0 left-0 w-64 z-20">
            <DashboardSidebar />
          </div>
        </aside>

      {/* Mobile sidebar — sheet drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <DashboardSidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
