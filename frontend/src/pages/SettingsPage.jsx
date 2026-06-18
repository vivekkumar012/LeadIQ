import { useState } from 'react'
import { Settings, Key, Database, Zap, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { scanApi } from '../utils/api'
import { Card, Button, Badge } from '../components/ui/index'

export default function SettingsPage() {
  const [bulkLoading, setBulkLoading] = useState(false)

  const handleBulkScore = async () => {
    try {
      setBulkLoading(true)
      const t = toast.loading('Re-scoring all leads with AI...')
      const data = await scanApi.bulkScore()
      toast.success(data.message, { id: t })
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBulkLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-2xl">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-white">Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Configure your LeadIQ platform</p>
      </div>

      {/* AI Config */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Key size={14} className="text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-white">AI Configuration</h2>
            <p className="text-xs text-slate-500 truncate">Groq API · Llama 3.3 70B (free tier)</p>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shrink-0">Active</Badge>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Model</label>
            <input
              disabled
              value="llama-3.3-70b-versatile"
              className="w-full h-9 px-3 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-slate-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Groq API Key</label>
            <input
              type="password"
              placeholder="Set in backend .env → GROQ_API_KEY"
              disabled
              className="w-full h-9 px-3 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-slate-500 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-600 mt-1.5">
              Configure in <code className="text-indigo-400">backend/.env</code> — get a free key at console.groq.com
            </p>
          </div>
        </div>
      </Card>

      {/* Database */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Database size={14} className="text-blue-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white">Database</h2>
            <p className="text-xs text-slate-500">MongoDB connection</p>
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1.5 block">MongoDB URI</label>
          <input
            type="password"
            placeholder="Set in backend .env → MONGODB_URI"
            disabled
            className="w-full h-9 px-3 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-slate-500 cursor-not-allowed"
          />
          <p className="text-[11px] text-slate-600 mt-1.5">
            Default: <code className="text-slate-400">mongodb://localhost:27017/leadgen</code>
          </p>
        </div>
      </Card>

      {/* Bulk operations */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Zap size={14} className="text-amber-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white">Bulk Operations</h2>
            <p className="text-xs text-slate-500">Batch AI operations on your leads</p>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
            <div>
              <div className="text-sm font-medium text-slate-200">Re-score all leads</div>
              <div className="text-xs text-slate-500 mt-0.5">Run AI scoring on every lead in your database</div>
            </div>
            <Button onClick={handleBulkScore} loading={bulkLoading} variant="secondary" size="sm" className="shrink-0 self-start sm:self-auto">
              <RefreshCw size={12} /> Run
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}