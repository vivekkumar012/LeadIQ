import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Filter, SortAsc, Download, Trash2, RefreshCw,
  ChevronLeft, ChevronRight, Globe, MapPin, Users, ArrowUpDown,
  ExternalLink, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import { leadsApi } from '../utils/api'
import {
  Card, Badge, Button, EmptyState, Skeleton, ScoreBar
} from '../components/ui/index'
import {
  getIntentBg, getStatusColor, getCompanyColor, getInitials,
  formatDate, getSignalIcon, getSignalColor
} from '../utils/helpers'

const STATUS_OPTIONS = ['', 'New', 'Contacted', 'Qualified', 'Disqualified', 'Converted']
const INTENT_OPTIONS = ['', 'Hot', 'Warm', 'Cold']
const SORT_OPTIONS = [
  { value: '-intentScore', label: 'Highest Score' },
  { value: 'intentScore', label: 'Lowest Score' },
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'companyName', label: 'A → Z' },
  { value: '-companyName', label: 'Z → A' },
]

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(new Set())
  const [filters, setFilters] = useState({
    search: '', status: '', intentLabel: '', sort: '-intentScore', page: 1
  })
  const navigate = useNavigate()

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const params = { ...filters, limit: 15 }
      Object.keys(params).forEach(k => !params[k] && delete params[k])
      const data = await leadsApi.list(params)
      setLeads(data.leads)
      setPagination(data.pagination)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const updateFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }))

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this lead?')) return
    try {
      await leadsApi.delete(id)
      toast.success('Lead deleted')
      load()
    } catch (e) { toast.error(e.message) }
  }

  const handleRescore = async (id, e) => {
    e.stopPropagation()
    try {
      const t = toast.loading('Re-scoring with AI...')
      await leadsApi.rescore(id)
      toast.success('Score updated', { id: t })
      load()
    } catch (e) { toast.error(e.message) }
  }

  const toggleSelect = (id, e) => {
    e.stopPropagation()
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-700 text-white">Leads</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination.total} companies discovered
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => leadsApi.exportCsv()}>
            <Download size={13} />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => navigate('/scan')}>
            <Zap size={13} />
            Discover Leads
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search companies, industries..."
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg
                text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          {/* Intent filter */}
          <select
            value={filters.intentLabel}
            onChange={e => updateFilter('intentLabel', e.target.value)}
            className="h-8 px-3 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-slate-300
              focus:outline-none focus:border-indigo-500/50 transition-all"
          >
            <option value="">All Intent</option>
            {INTENT_OPTIONS.filter(Boolean).map(o => <option key={o} value={o}>{o}</option>)}
          </select>

          {/* Status filter */}
          <select
            value={filters.status}
            onChange={e => updateFilter('status', e.target.value)}
            className="h-8 px-3 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-slate-300
              focus:outline-none focus:border-indigo-500/50 transition-all"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.filter(Boolean).map(o => <option key={o} value={o}>{o}</option>)}
          </select>

          {/* Sort */}
          <select
            value={filters.sort}
            onChange={e => updateFilter('sort', e.target.value)}
            className="h-8 px-3 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-slate-300
              focus:outline-none focus:border-indigo-500/50 transition-all"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <Button variant="ghost" size="sm" onClick={load}>
            <RefreshCw size={13} />
          </Button>
        </div>
      </Card>

      {/* Leads list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads found"
          description="Adjust your filters or run the AI Scanner to discover new companies"
          action={
            <Button size="sm" onClick={() => navigate('/scan')}>
              <Zap size={13} /> Run AI Scanner
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {leads.map((lead, idx) => (
            <Card
              key={lead._id}
              hover
              onClick={() => navigate(`/leads/${lead._id}`)}
              className="p-4 animate-fade-in-up"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <div className="flex items-center gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selected.has(lead._id)}
                  onChange={e => toggleSelect(lead._id, e)}
                  onClick={e => e.stopPropagation()}
                  className="w-4 h-4 rounded accent-indigo-500 cursor-pointer shrink-0"
                />

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getCompanyColor(lead.companyName)}
                  flex items-center justify-center text-sm font-700 text-white shrink-0 shadow-lg`}>
                  {getInitials(lead.companyName)}
                </div>

                {/* Company info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-600 text-white">{lead.companyName}</span>
                    <Badge className={getIntentBg(lead.intentLabel)}>{lead.intentLabel}</Badge>
                    <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                    {lead.fundingRound && (
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                        💰 {lead.fundingRound}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    {lead.industry && <span>{lead.industry}</span>}
                    {lead.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={10} /> {lead.location}
                      </span>
                    )}
                    {lead.size && (
                      <span className="flex items-center gap-1">
                        <Users size={10} /> {lead.size}
                      </span>
                    )}
                    {lead.website && (
                      <span className="flex items-center gap-1">
                        <Globe size={10} /> {lead.website}
                      </span>
                    )}
                    <span className="text-slate-600">{formatDate(lead.createdAt)}</span>
                  </div>
                  {/* Signals */}
                  {lead.signals?.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {lead.signals.slice(0, 3).map((sig, i) => (
                        <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-500 border ${getSignalColor(sig.type)}`}>
                          {getSignalIcon(sig.type)} {sig.type}
                        </span>
                      ))}
                      {lead.signals.length > 3 && (
                        <span className="text-[10px] text-slate-600">+{lead.signals.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Score */}
                <div className="w-28 shrink-0 hidden sm:block">
                  <div className="text-[10px] text-slate-600 mb-1">Intent Score</div>
                  <ScoreBar score={lead.intentScore} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  {lead.website && (
                    <a
                      href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                  <button
                    onClick={e => handleRescore(lead._id, e)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                    title="Re-score with AI"
                  >
                    <Zap size={13} />
                  </button>
                  <button
                    onClick={e => handleDelete(lead._id, e)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            Page {pagination.page} of {pagination.pages} · {pagination.total} leads
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary" size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
            >
              <ChevronLeft size={13} />
            </Button>
            <Button
              variant="secondary" size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
            >
              <ChevronRight size={13} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
