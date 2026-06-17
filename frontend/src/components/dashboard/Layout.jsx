import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Zap, Users, Settings, TrendingUp,
  Bell, Search, ChevronRight, Sparkles, Activity
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
  const location = useLocation()

  const currentPage = navItems.find(n => location.pathname.startsWith(n.to))?.label || 'LeadIQ'

  return (
    <div className="flex h-screen bg-[#080d1a] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col shrink-0 transition-all duration-300 ease-in-out border-r border-white/[0.06]
          ${collapsed ? 'w-16' : 'w-60'}`}
        style={{ background: 'linear-gradient(180deg, #0d1525 0%, #080d1a 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25">
            <Sparkles size={15} className="text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-fade-in-up">
              <span className="text-sm font-700 text-white tracking-tight">LeadIQ</span>
              <span className="text-[10px] text-slate-500 font-500">AI Sales Intelligence</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
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
                    <span className="text-sm font-500">{label}</span>
                  )}
                  {!collapsed && label === 'AI Scanner' && (
                    <span className="ml-auto text-[9px] font-600 bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-500/20">
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
              <span className="text-[11px] text-slate-400 font-500">System Status</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-400">All systems operational</span>
            </div>
          </div>
        )}

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-10 border-t border-white/[0.06] text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ChevronRight size={14} className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.06] shrink-0"
          style={{ background: 'rgba(8,13,26,0.8)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">LeadIQ</span>
            <ChevronRight size={14} className="text-slate-600" />
            <span className="text-sm font-500 text-slate-200">{currentPage}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Quick search..."
                className="h-8 pl-8 pr-3 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-slate-300
                  placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all w-48"
              />
            </div>
            <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-700 text-white shadow">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
