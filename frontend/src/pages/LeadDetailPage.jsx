import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Globe, MapPin, Users, Building2, Zap, Send,
  RefreshCw, ExternalLink, Mail, Tag, Star,
  MessageSquare, ChevronDown, Check, Link2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { leadsApi } from '../utils/api'
import { Card, Badge, Button, ScoreRing, Skeleton } from '../components/ui/index'
import {
  getIntentBg, getStatusColor, getCompanyColor, getInitials,
  getSignalColor, getSignalIcon, formatDate
} from '../utils/helpers'

const STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Disqualified', 'Converted']

export default function LeadDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rescoring, setRescoring] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI sales assistant. Ask me anything about this company — outreach strategies, talking points, email drafts, or company analysis.' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const chatEndRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await leadsApi.get(id)
        setLead(data)
      } catch (e) {
        toast.error(e.message)
        navigate('/leads')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleRescore = async () => {
    try {
      setRescoring(true)
      const updated = await leadsApi.rescore(id)
      setLead(updated)
      toast.success('Lead re-scored with AI')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setRescoring(false)
    }
  }

  const handleStatusChange = async (status) => {
    try {
      const updated = await leadsApi.update(id, { status })
      setLead(updated)
      toast.success(`Status → ${status}`)
    } catch (e) {
      toast.error(e.message)
    }
  }

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return
    const msg = chatInput.trim()
    setChatInput('')
    const newMessages = [...chatMessages, { role: 'user', content: msg }]
    setChatMessages(newMessages)
    setChatLoading(true)
    try {
      const history = newMessages.slice(1).map(m => ({ role: m.role, content: m.content }))
      const { reply } = await leadsApi.chat(id, msg, history.slice(-6))
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      toast.error(e.message)
    } finally {
      setChatLoading(false)
    }
  }

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-48 rounded-xl col-span-2" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  )

  if (!lead) return null

  return (
    <div className="p-6 space-y-5 animate-fade-in-up">
      {/* Back */}
      <button
        onClick={() => navigate('/leads')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft size={15} /> Back to Leads
      </button>

      {/* Hero card */}
      <Card className="p-6">
        <div className="flex items-start gap-5 flex-wrap">
          {/* Avatar */}
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getCompanyColor(lead.companyName)}
            flex items-center justify-center text-xl font-700 text-white shadow-xl shrink-0`}>
            {getInitials(lead.companyName)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-xl font-700 text-white">{lead.companyName}</h1>
              <Badge className={getIntentBg(lead.intentLabel)}>{lead.intentLabel}</Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap mb-3">
              {lead.industry && <span className="flex items-center gap-1"><Building2 size={11} />{lead.industry}</span>}
              {lead.location && <span className="flex items-center gap-1"><MapPin size={11} />{lead.location}</span>}
              {lead.size && <span className="flex items-center gap-1"><Users size={11} />{lead.size} employees</span>}
              {lead.stage && <span className="flex items-center gap-1"><Star size={11} />{lead.stage}</span>}
            </div>
            {lead.description && (
              <p className="text-sm text-slate-400 leading-relaxed">{lead.description}</p>
            )}
          </div>

          {/* Score ring */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="relative">
              <ScoreRing score={lead.intentScore} size={72} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-700 text-white">{lead.intentScore}</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-500">Intent Score</span>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/[0.06] flex-wrap">
          {/* Status dropdown */}
          <div className="relative group">
            <Button variant="secondary" size="sm">
              <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
              <ChevronDown size={12} />
            </Button>
            <div className="absolute top-full left-0 mt-1 bg-[#1e293b] border border-white/[0.1] rounded-xl shadow-2xl z-10 py-1 min-w-36 hidden group-hover:block">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06] transition-all"
                >
                  {lead.status === s && <Check size={11} className="text-indigo-400" />}
                  <span className={lead.status === s ? 'ml-0' : 'ml-3.5'}>{s}</span>
                </button>
              ))}
            </div>
          </div>

          {lead.website && (
            <a
              href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
              target="_blank" rel="noopener noreferrer"
            >
              <Button variant="secondary" size="sm">
                <Globe size={13} /> Website <ExternalLink size={11} />
              </Button>
            </a>
          )}

          {lead.linkedinUrl && (
            <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm">
                <Link2 size={13} /> LinkedIn
              </Button>
            </a>
          )}

          <Button onClick={handleRescore} loading={rescoring} variant="secondary" size="sm">
            <Zap size={13} /> Re-score AI
          </Button>

          <div className="ml-auto text-xs text-slate-600">
            Scanned {formatDate(lead.scannedAt)}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.06] rounded-xl p-1">
        {['overview', 'signals', 'contacts', 'ai chat'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 h-8 rounded-lg text-xs font-500 capitalize transition-all
              ${activeTab === tab
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab === 'ai chat' && <MessageSquare size={11} className="inline mr-1" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in-up">
          {/* AI Summary */}
          {lead.aiSummary && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-indigo-400" />
                <h3 className="text-sm font-600 text-white">AI Analysis</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{lead.aiSummary}</p>
            </Card>
          )}

          {/* Details */}
          <Card className="p-5">
            <h3 className="text-sm font-600 text-white mb-3">Company Details</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Industry', value: lead.industry },
                { label: 'Stage', value: lead.stage },
                { label: 'Size', value: lead.size },
                { label: 'Location', value: lead.location },
                { label: 'Funding', value: lead.fundingAmount ? `${lead.fundingAmount} (${lead.fundingRound})` : lead.fundingRound },
                { label: 'Website', value: lead.website },
              ].filter(f => f.value).map(f => (
                <div key={f.label} className="flex items-start gap-3">
                  <span className="text-xs text-slate-600 w-20 shrink-0 pt-0.5">{f.label}</span>
                  <span className="text-xs text-slate-300 flex-1">{f.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Tags */}
          {lead.tags?.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={14} className="text-slate-500" />
                <h3 className="text-sm font-600 text-white">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {lead.tags.map((tag, i) => (
                  <Badge key={i} className="bg-white/[0.06] text-slate-400 border-white/[0.08]">{tag}</Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'signals' && (
        <div className="space-y-3 animate-fade-in-up">
          {lead.signals?.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-slate-500">No signals detected for this company</p>
            </Card>
          ) : (
            lead.signals?.map((sig, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">{getSignalIcon(sig.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getSignalColor(sig.type)}>{sig.type}</Badge>
                      <span className="text-xs text-slate-600">{formatDate(sig.detectedAt)}</span>
                    </div>
                    <p className="text-sm text-slate-300">{sig.description}</p>
                    {sig.source && <p className="text-xs text-slate-600 mt-1">Source: {sig.source}</p>}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="space-y-3 animate-fade-in-up">
          {lead.contacts?.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-slate-500">No contacts found for this company</p>
            </Card>
          ) : (
            lead.contacts?.map((contact, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getCompanyColor(contact.name)}
                    flex items-center justify-center text-sm font-700 text-white`}>
                    {getInitials(contact.name)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-600 text-white">{contact.name}</div>
                    <div className="text-xs text-slate-500">{contact.title}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all">
                        <Mail size={14} />
                      </a>
                    )}
                    {contact.linkedin && (
                      <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all">
                        <Link2 size={14} />
                      </a>
                    )}
                  </div>
                </div>
                {contact.email && (
                  <div className="mt-2 ml-14 text-xs text-slate-500">{contact.email}</div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'ai chat' && (
        <Card className="flex flex-col h-[480px] animate-fade-in-up">
          {/* Chat header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/[0.06]">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center">
              <Zap size={14} className="text-indigo-400" />
            </div>
            <div>
              <div className="text-sm font-600 text-white">AI Sales Assistant</div>
              <div className="text-[11px] text-slate-500">Powered by Llama 3.3 70B</div>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-400">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-indigo-500/20 text-indigo-100 border border-indigo-500/20'
                    : 'bg-white/[0.04] text-slate-300 border border-white/[0.06]'}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Ask about outreach strategy, email drafts, company analysis..."
                className="flex-1 h-9 px-3 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg
                  text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
              <Button onClick={sendChat} loading={chatLoading} size="sm">
                <Send size={13} />
              </Button>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {['Draft outreach email', 'Key talking points', 'Why they need SDRs', 'Competitor analysis'].map(q => (
                <button
                  key={q}
                  onClick={() => { setChatInput(q); }}
                  className="text-[10px] text-slate-600 hover:text-indigo-400 px-2 py-1 rounded-md bg-white/[0.02] hover:bg-indigo-500/10 border border-white/[0.04] transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
