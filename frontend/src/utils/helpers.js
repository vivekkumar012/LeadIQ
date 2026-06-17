export function getIntentColor(label) {
  switch (label) {
    case 'Hot': return 'text-red-400'
    case 'Warm': return 'text-amber-400'
    case 'Cold': return 'text-slate-400'
    default: return 'text-slate-400'
  }
}

export function getIntentBg(label) {
  switch (label) {
    case 'Hot': return 'bg-red-500/10 text-red-400 border-red-500/20'
    case 'Warm': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case 'Cold': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
}

export function getScoreGradient(score) {
  if (score >= 75) return 'from-red-500 to-orange-500'
  if (score >= 50) return 'from-amber-500 to-yellow-400'
  return 'from-slate-500 to-slate-400'
}

export function getSignalIcon(type) {
  const icons = {
    funding: '💰',
    hiring: '👥',
    expansion: '🚀',
    growth: '📈',
    social: '💬',
    keyword: '🔍',
  }
  return icons[type] || '📌'
}

export function getSignalColor(type) {
  const colors = {
    funding: 'bg-green-500/10 text-green-400 border-green-500/20',
    hiring: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    expansion: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    growth: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    social: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    keyword: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  }
  return colors[type] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'
}

export function getStatusColor(status) {
  const colors = {
    New: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    Contacted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Qualified: 'bg-green-500/10 text-green-400 border-green-500/20',
    Disqualified: 'bg-red-500/10 text-red-400 border-red-500/20',
    Converted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  }
  return colors[status] || 'bg-slate-500/10 text-slate-400'
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export function getCompanyColor(name) {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-blue-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-blue-600',
  ]
  const idx = (name || '').charCodeAt(0) % colors.length
  return colors[idx]
}
