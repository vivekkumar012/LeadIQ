import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Zap, Search, Globe, FileText, RefreshCw, CheckCircle,
  ArrowRight, Sparkles, TrendingUp, Users, DollarSign, Hash
} from 'lucide-react'
import toast from 'react-hot-toast'
import { scanApi } from '../utils/api'
import { Card, Badge, Button, ScoreBar } from '../components/ui/index'
import { getIntentBg, getCompanyColor, getInitials, getSignalIcon, getSignalColor } from '../utils/helpers'

const SIGNAL_TYPES = [
  { id: 'funding', label: 'Recent Funding', icon: '💰', desc: 'Companies that raised Series A/B/C' },
  { id: 'hiring', label: 'Hiring SDRs', icon: '👥', desc: 'Actively recruiting sales roles' },
  { id: 'expansion', label: 'Expansion', icon: '🚀', desc: 'Entering new markets or verticals' },
  { id: 'growth', label: 'Growth Signals', icon: '📈', desc: 'Social & PR growth indicators' },
]

const INDUSTRIES = [
  'SaaS', 'FinTech', 'HealthTech', 'E-commerce', 'AgriTech',
  'EdTech', 'PropTech', 'InsurTech', 'LegalTech', 'MarTech',
  'HR Tech', 'Logistics', 'Cybersecurity', 'AI/ML', 'Web3'
]

export default function ScanPage() {
  const [mode, setMode] = useState('discover') // discover | text
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [config, setConfig] = useState({
    count: 8,
    industry: '',
    signalType: '',
  })
  const [pastedText, setPastedText] = useState('')
  const [progress, setProgress] = useState(0)
  const navigate = useNavigate()

  const runDiscover = async () => {
    try {
      setLoading(true)
      setResults([])
      setProgress(0)

      // Simulate progress
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + Math.random() * 15, 90))
      }, 800)

      const data = await scanApi.discover(config)
      clearInterval(interval)
      setProgress(100)
      setResults(data.leads || [])
      toast.success(`Discovered ${data.count} new leads!`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const runFromText = async () => {
    if (!pastedText.trim()) return toast.error('Paste some text first')
    try {
      setLoading(true)
      const data = await scanApi.fromText(pastedText, 'manual-paste')
      setResults([data.lead])
      toast.success('Lead extracted from text!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center">
            <Zap size={14} className="text-indigo-400" />
          </div>
          <h1 className="text-xl font-700 text-white">AI Lead Scanner</h1>
          
        </div>
        <p className="text-sm text-slate-500">
          Automatically discover and score companies using AI-powered intent signals
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2">
        {[
          { id: 'discover', label: 'Auto Discover', icon: Sparkles },
          { id: 'text', label: 'From Text/URL', icon: FileText },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-500 transition-all
              ${mode === id
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 border border-white/[0.06] hover:bg-white/[0.04]'}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Config panel */}
        <div className="space-y-4">
          {mode === 'discover' ? (
            <>
              <Card className="p-5">
                <h2 className="text-sm font-600 text-white mb-4">Discovery Settings</h2>

                {/* Count */}
                <div className="mb-4">
                  <label className="text-xs text-slate-400 font-500 mb-2 block">
                    Leads to discover: <span className="text-indigo-400">{config.count}</span>
                  </label>
                  <input
                    type="range" min="3" max="20" value={config.count}
                    onChange={e => setConfig(c => ({ ...c, count: Number(e.target.value) }))}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                    <span>3</span><span>20</span>
                  </div>
                </div>

                {/* Industry */}
                <div className="mb-4">
                  <label className="text-xs text-slate-400 font-500 mb-2 block">Industry Focus</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setConfig(c => ({ ...c, industry: '' }))}
                      className={`px-2 py-1 rounded-md text-[11px] font-500 transition-all border
                        ${!config.industry
                          ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20'
                          : 'text-slate-500 border-white/[0.06] hover:border-white/[0.12]'}`}
                    >
                      All
                    </button>
                    {INDUSTRIES.map(ind => (
                      <button
                        key={ind}
                        onClick={() => setConfig(c => ({ ...c, industry: ind }))}
                        className={`px-2 py-1 rounded-md text-[11px] font-500 transition-all border
                          ${config.industry === ind
                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20'
                            : 'text-slate-500 border-white/[0.06] hover:border-white/[0.12]'}`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Signal types */}
              <Card className="p-5">
                <h2 className="text-sm font-600 text-white mb-3">Signal Types</h2>
                <div className="space-y-2">
                  {SIGNAL_TYPES.map(sig => (
                    <button
                      key={sig.id}
                      onClick={() => setConfig(c => ({ ...c, signalType: c.signalType === sig.id ? '' : sig.id }))}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all border text-left
                        ${config.signalType === sig.id
                          ? 'bg-indigo-500/10 border-indigo-500/20'
                          : 'border-white/[0.06] hover:bg-white/[0.03]'}`}
                    >
                      <span className="text-lg">{sig.icon}</span>
                      <div>
                        <div className="text-xs font-500 text-slate-200">{sig.label}</div>
                        <div className="text-[10px] text-slate-500">{sig.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              <Button
                onClick={runDiscover}
                loading={loading}
                className="w-full"
                size="lg"
              >
                <Zap size={15} />
                {loading ? 'Scanning...' : 'Run AI Scanner'}
              </Button>
            </>
          ) : (
            <Card className="p-5">
              <h2 className="text-sm font-600 text-white mb-3">Paste Company Info</h2>
              <p className="text-xs text-slate-500 mb-3">
                Paste a LinkedIn post, job listing, news article, or any text mentioning a company.
                AI will extract and score the lead automatically.
              </p>
              <textarea
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                placeholder="Paste text here... e.g. 'Acme Corp just raised $5M Series A and is hiring 3 SDRs to expand into Europe...'"
                rows={8}
                className="w-full px-3 py-2.5 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg
                  text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50
                  transition-all resize-none"
              />
              <Button
                onClick={runFromText}
                loading={loading}
                className="w-full mt-3"
                size="md"
              >
                <Sparkles size={14} />
                Extract & Score Lead
              </Button>
            </Card>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {/* Progress bar */}
          {loading && progress > 0 && (
            <Card className="p-5 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Search size={13} className="text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-500 text-white">AI Scanning in progress...</div>
                  <div className="text-xs text-slate-500">Discovering companies and scoring intent</div>
                </div>
                <span className="ml-auto text-sm font-600 text-indigo-400">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {['Searching signals', 'Enriching companies', 'Scoring with AI'].map((step, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs ${progress > (i + 1) * 30 ? 'text-emerald-400' : 'text-slate-600'}`}>
                    {progress > (i + 1) * 30
                      ? <CheckCircle size={11} />
                      : <div className="w-2.5 h-2.5 rounded-full border border-current opacity-40" />
                    }
                    {step}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Results list */}
          {results.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  <span className="font-600 text-white">{results.length}</span> leads discovered
                </span>
                <Button variant="secondary" size="sm" onClick={() => navigate('/leads')}>
                  View all leads <ArrowRight size={12} />
                </Button>
              </div>
              {results.map((lead, i) => (
                <Card
                  key={lead._id || i}
                  hover
                  onClick={() => lead._id && navigate(`/leads/${lead._id}`)}
                  className="p-4 animate-fade-in-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getCompanyColor(lead.companyName)}
                      flex items-center justify-center text-sm font-700 text-white shrink-0`}>
                      {getInitials(lead.companyName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-600 text-white">{lead.companyName}</span>
                        <Badge className={getIntentBg(lead.intentLabel)}>{lead.intentLabel}</Badge>
                        {lead.stage && (
                          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">{lead.stage}</Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mb-2">{lead.industry} · {lead.location}</div>
                      {lead.description && (
                        <p className="text-xs text-slate-400 mb-2 line-clamp-2">{lead.description}</p>
                      )}
                      {lead.signals?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {lead.signals.slice(0, 3).map((sig, j) => (
                            <span key={j} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-500 border ${getSignalColor(sig.type)}`}>
                              {getSignalIcon(sig.type)} {sig.type}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="w-24 shrink-0">
                      <div className="text-[10px] text-slate-600 mb-1">Score</div>
                      <ScoreBar score={lead.intentScore} />
                    </div>
                  </div>
                  {lead.aiSummary && (
                    <div className="mt-3 pt-3 border-t border-white/[0.04]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Zap size={10} className="text-indigo-400" />
                        <span className="text-[10px] text-indigo-400 font-500">AI Insight</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{lead.aiSummary}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : !loading ? (
            <Card className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-indigo-400" />
              </div>
              <h3 className="text-sm font-600 text-slate-300 mb-2">Ready to scan</h3>
              <p className="text-xs text-slate-500 text-center max-w-xs">
                Configure your filters and click "Run AI Scanner" to discover high-intent companies
              </p>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
