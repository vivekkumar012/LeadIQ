import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Zap, Users, Settings,
  Bell, Search, ChevronRight, Sparkles, Activity, X, Menu
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/scan', icon: Zap, label: 'AI Scanner' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const currentPage = navItems.find(n => location.pathname.startsWith(n.to))?.label || 'LeadIQ'

  return (
    <div className="flex h-screen bg-[#080d1a] overflow-hidden">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless mobileOpen, always visible lg+ */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-40 flex flex-col shrink-0
          transition-all duration-300 ease-in-out border-r border-white/[0.06]
          ${collapsed ? 'w-16' : 'w-60'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ background: 'linear-gradient(180deg, #0d1525 0%, #080d1a 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25">
            <Sparkles size={15} className="text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col flex-1">
              <span className="text-sm font-bold text-white tracking-tight">LeadIQ</span>
              <span className="text-[10px] text-slate-500">AI Sales Intelligence</span>
            </div>
          )}
          {/* Close button on mobile */}
          {!collapsed && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative
                ${isActive
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />
                  )}
                  <Icon size={17} className="shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium">{label}</span>
                  )}
                  {!collapsed && label === 'AI Scanner' && (
                    <span className="ml-auto text-[9px] font-semibold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-500/20">
                      AI
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom status */}
        {!collapsed && (
          <div className="m-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={12} className="text-emerald-400" />
              <span className="text-[11px] text-slate-400 font-medium">System Status</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-400">All systems operational</span>
            </div>
          </div>
        )}

        {/* Collapse button — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-10 border-t border-white/[0.06] text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ChevronRight size={14} className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header
          className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-white/[0.06] shrink-0"
          style={{ background: 'rgba(8,13,26,0.8)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-2">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all mr-1"
            >
              <Menu size={17} />
            </button>
            <span className="text-slate-500 text-sm hidden sm:block">LeadIQ</span>
            <ChevronRight size={14} className="text-slate-600 hidden sm:block" />
            <span className="text-sm font-medium text-slate-200">{currentPage}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search — hidden on small mobile */}
            <div className="relative hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Quick search..."
                className="h-8 pl-8 pr-3 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-slate-300
                  placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all w-36 lg:w-48"
              />
            </div>
            <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 lg:hidden border-t border-white/[0.06] flex"
        style={{ background: 'rgba(8,13,26,0.97)', backdropFilter: 'blur(16px)' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-all
              ${isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isActive ? 'bg-indigo-500/15' : ''}`}>
                  <Icon size={17} />
                </div>
                <span>{label === 'AI Scanner' ? 'Scanner' : label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}