import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Filter, Download, Trash2, RefreshCw,
  ChevronLeft, ChevronRight, Globe, MapPin, Users,
  ExternalLink, Zap, SlidersHorizontal
} from 'lucide-react'
import toast from 'react-hot-toast'
import { leadsApi } from '../utils/api'
import { Card, Badge, Button, EmptyState, Skeleton, ScoreBar } from '../components/ui/index'
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
  const [showFilters, setShowFilters] = useState(false)
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

  const activeFilterCount = [filters.status, filters.intentLabel].filter(Boolean).length

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white">Leads</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {pagination.total} companies discovered
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => leadsApi.exportCsv()} className="hidden sm:inline-flex">
            <Download size={13} />
            Export
          </Button>
          <Button size="sm" onClick={() => navigate('/scan')}>
            <Zap size={13} />
            <span className="hidden sm:inline">Discover Leads</span>
            <span className="sm:hidden">Scan</span>
          </Button>
        </div>
      </div>

      {/* Search row — always visible */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search companies..."
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            className="w-full h-9 pl-8 pr-3 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg
              text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
        {/* Filter toggle — mobile */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`sm:hidden relative flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border transition-all
            ${showFilters || activeFilterCount > 0
              ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20'
              : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'}`}
        >
          <SlidersHorizontal size={13} />
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
        <Button variant="ghost" size="sm" onClick={load} className="hidden sm:inline-flex">
          <RefreshCw size={13} />
        </Button>
      </div>

      {/* Filters — desktop always, mobile collapsible */}
      <Card className={`p-3 sm:p-4 ${showFilters ? 'block' : 'hidden sm:block'}`}>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={filters.intentLabel}
            onChange={e => updateFilter('intentLabel', e.target.value)}
            className="h-8 px-2 sm:px-3 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-slate-300
              focus:outline-none focus:border-indigo-500/50 transition-all flex-1 sm:flex-none min-w-0"
          >
            <option value="">All Intent</option>
            {INTENT_OPTIONS.filter(Boolean).map(o => <option key={o} value={o}>{o}</option>)}
          </select>

          <select
            value={filters.status}
            onChange={e => updateFilter('status', e.target.value)}
            className="h-8 px-2 sm:px-3 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-slate-300
              focus:outline-none focus:border-indigo-500/50 transition-all flex-1 sm:flex-none min-w-0"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.filter(Boolean).map(o => <option key={o} value={o}>{o}</option>)}
          </select>

          <select
            value={filters.sort}
            onChange={e => updateFilter('sort', e.target.value)}
            className="h-8 px-2 sm:px-3 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-slate-300
              focus:outline-none focus:border-indigo-500/50 transition-all flex-1 sm:flex-none min-w-0"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <Button variant="ghost" size="sm" onClick={load} className="sm:hidden">
            <RefreshCw size={13} /> Refresh
          </Button>
        </div>
      </Card>

      {/* Leads list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 sm:h-24" />)}
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
              className="p-3 sm:p-4"
            >
              <div className="flex items-start sm:items-center gap-3">
                {/* Checkbox — hidden on mobile to save space */}
                <input
                  type="checkbox"
                  checked={selected.has(lead._id)}
                  onChange={e => toggleSelect(lead._id, e)}
                  onClick={e => e.stopPropagation()}
                  className="hidden sm:block w-4 h-4 rounded accent-indigo-500 cursor-pointer shrink-0 mt-1 sm:mt-0"
                />

                {/* Avatar */}
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${getCompanyColor(lead.companyName)}
                  flex items-center justify-center text-xs sm:text-sm font-bold text-white shrink-0`}>
                  {getInitials(lead.companyName)}
                </div>

                {/* Company info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start sm:items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-white">{lead.companyName}</span>
                    <Badge className={getIntentBg(lead.intentLabel)}>{lead.intentLabel}</Badge>
                    <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                    {lead.fundingRound && (
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hidden sm:inline-flex">
                        💰 {lead.fundingRound}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 flex-wrap">
                    {lead.industry && <span>{lead.industry}</span>}
                    {lead.location && (
                      <span className="hidden sm:flex items-center gap-1">
                        <MapPin size={10} /> {lead.location}
                      </span>
                    )}
                    {lead.size && (
                      <span className="hidden sm:flex items-center gap-1">
                        <Users size={10} /> {lead.size}
                      </span>
                    )}
                    <span className="text-slate-600">{formatDate(lead.createdAt)}</span>
                  </div>

                  {/* Score — inline on mobile */}
                  <div className="mt-2 sm:hidden">
                    <ScoreBar score={lead.intentScore} />
                  </div>

                  {/* Signals */}
                  {lead.signals?.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {lead.signals.slice(0, 2).map((sig, i) => (
                        <span key={i} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${getSignalColor(sig.type)}`}>
                          {getSignalIcon(sig.type)} {sig.type}
                        </span>
                      ))}
                      {lead.signals.length > 2 && (
                        <span className="text-[10px] text-slate-600">+{lead.signals.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Score — desktop */}
                <div className="w-24 shrink-0 hidden sm:block">
                  <div className="text-[10px] text-slate-600 mb-1">Intent Score</div>
                  <ScoreBar score={lead.intentScore} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  {lead.website && (
                    <a
                      href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all hidden sm:flex"
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
            <span className="hidden sm:inline">Page {pagination.page} of {pagination.pages} · </span>
            {pagination.total} leads
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary" size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
            >
              <ChevronLeft size={13} />
            </Button>
            <span className="text-xs text-slate-500 px-1">{pagination.page} / {pagination.pages}</span>
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