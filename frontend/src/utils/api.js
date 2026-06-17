import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.error || err.message || 'Something went wrong'
    return Promise.reject(new Error(msg))
  }
)

export const leadsApi = {
  list: (params) => api.get('/leads', { params }),
  get: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.patch(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  rescore: (id) => api.post(`/leads/${id}/rescore`),
  chat: (id, message, history) => api.post(`/leads/${id}/chat`, { message, history }),
  exportCsv: () => window.open('/api/leads/export/csv', '_blank'),
}

export const scanApi = {
  discover: (data) => api.post('/scan/discover', data),
  enrich: (id) => api.post(`/scan/enrich/${id}`),
  fromText: (text, source) => api.post('/scan/from-text', { text, source }),
  bulkScore: () => api.post('/scan/bulk-score'),
}

export const statsApi = {
  overview: () => api.get('/stats/overview'),
}

export default api
