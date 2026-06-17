import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Flame, TrendingUp, Target, Zap, ArrowRight,
  BarChart3, Activity, RefreshCw
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts'
import { statsApi } from '../utils/api'
import { StatCard, Card, Badge, Button, Skeleton, ScoreBar } from '../components/ui/index'
import { getIntentBg, getCompanyColor, getInitials, formatDate, getSignalIcon } from '../utils/helpers'

const COLORS = ['#6366f1', '#f59e0b', '#64748b', '#10b981', '#8b5cf6', '#ec4899']

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1e293b] border border-white/[0.08] rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.color }} className="font-600">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = async () => {
    try {
      setLoading(true)
      const data = await statsApi.overview()
      setStats(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-72 rounded-xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  )

  const intentData = stats ? [
    { name: 'Hot', value: stats.totals.hot, color: '#ef4444' },
    { name: 'Warm', value: stats.totals.warm, color: '#f59e0b' },
    { name: 'Cold', value: stats.totals.cold, color: '#475569' },
  ] : []

  const signalData = (stats?.signalBreakdown || []).slice(0, 6).map((s, i) => ({
    name: s._id || 'unknown',
    value: s.count,
    fill: COLORS[i % COLORS.length]
  }))

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-700 text-white">Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time intelligence on your pipeline</p>
        </div>
        <Button onClick={load} variant="secondary" size="sm">
          <RefreshCw size={13} />
          Refresh
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Leads"
          value={stats?.totals.all || 0}
          icon={Users}
          accent="indigo"
          sub="All discovered companies"
        />
        <StatCard
          label="Hot Prospects"
          value={stats?.totals.hot || 0}
          icon={Flame}
          accent="red"
          sub="Score ≥ 75"
        />
        <StatCard
          label="Avg. Intent Score"
          value={stats?.avgIntentScore || 0}
          icon={TrendingUp}
          accent="amber"
          sub="Across all leads"
        />
        <StatCard
          label="New This Scan"
          value={stats?.totals.new || 0}
          icon={Target}
          accent="emerald"
          sub="Awaiting contact"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Industry chart */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-600 text-white">Leads by Industry</h2>
              <p className="text-xs text-slate-500 mt-0.5">Average intent score by sector</p>
            </div>
            <BarChart3 size={16} className="text-slate-600" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.byIndustry || []} barSize={14}>
              <XAxis
                dataKey="_id"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={40}
              />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" name="Leads" fill="#6366f1" radius={[4,4,0,0]} opacity={0.85} />
              <Bar dataKey="avgScore" name="Avg Score" fill="#f59e0b" radius={[4,4,0,0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Intent distribution */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-600 text-white">Intent Mix</h2>
              <p className="text-xs text-slate-500 mt-0.5">Distribution of lead temperature</p>
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={intentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {intentData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {intentData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <span className="font-600 text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top leads */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-600 text-white">Top Prospects</h2>
            <button
              onClick={() => navigate('/leads')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {(stats?.topLeads || []).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No leads yet — run the AI Scanner</p>
            ) : (
              stats.topLeads.map((lead) => (
                <div
                  key={lead._id}
                  onClick={() => navigate(`/leads/${lead._id}`)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all border border-white/[0.04] group"
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${getCompanyColor(lead.companyName)} flex items-center justify-center text-xs font-700 text-white shrink-0`}>
                    {getInitials(lead.companyName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-500 text-slate-200 truncate">{lead.companyName}</span>
                      <Badge className={getIntentBg(lead.intentLabel)}>{lead.intentLabel}</Badge>
                    </div>
                    <ScoreBar score={lead.intentScore} />
                  </div>
                  <ArrowRight size={13} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Signal breakdown */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-600 text-white">Signal Sources</h2>
            <Activity size={15} className="text-slate-600" />
          </div>
          {signalData.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No signals detected yet</p>
          ) : (
            <div className="space-y-3">
              {signalData.map((s) => {
                const max = Math.max(...signalData.map(x => x.value))
                const pct = (s.value / max) * 100
                return (
                  <div key={s.name} className="flex items-center gap-3">
                    <span className="text-base">{getSignalIcon(s.name)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs capitalize text-slate-300 font-500">{s.name}</span>
                        <span className="text-xs text-slate-500">{s.value}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: s.fill }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
