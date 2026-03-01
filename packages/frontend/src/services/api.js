import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: '/api'
})

api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  signup: (email, password, firstName, lastName) =>
    api.post('/auth/signup', { email, password, firstName, lastName }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile')
}

export const chatAPI = {
  getConversations: () => api.get('/conversations'),
  createConversation: (participantIds) =>
    api.post('/conversations', { participantIds }),
  getMessages: (conversationId) =>
    api.get(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, content, type = 'text') =>
    api.post(`/conversations/${conversationId}/messages`, { content, type }),
  markAsRead: (conversationId) =>
    api.put(`/conversations/${conversationId}/read`)
}

export const userAPI = {
  searchUsers: (query) => api.get('/users/search', { params: { q: query } }),
  getUser: (userId) => api.get(`/users/${userId}`),
  updateProfile: (data) => api.put('/users/profile', data)
}

export const aiAPI = {
  startPersonalityTraining: () => api.post('/ai/personality/start'),
  submitTrainingData: (data) =>
    api.post('/ai/personality/train', data),
  startVoiceCloning: () => api.post('/ai/voice/start'),
  uploadVoiceSample: (audioBlob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob)
    return api.post('/ai/voice/upload', formData)
  },
  getPersonalityProfile: () => api.get('/ai/personality/profile'),
  memorializeProfile: () => api.post('/ai/memorialization/activate'),
  interactWithAIClone: (userId, message) =>
    api.post('/ai/legacy/chat', { userId, message })
}

export const conciergeAPI = {
  getVault: () => api.get('/concierge'),
  addDocument: (data) => api.post('/concierge/documents', data),
  deleteDocument: (docId) => api.delete(`/concierge/documents/${docId}`),
  addTask: (data) => api.post('/concierge/tasks', data),
  updateTask: (taskId, data) => api.put(`/concierge/tasks/${taskId}`, data),
  addExecutor: (data) => api.post('/concierge/executors', data),
  addPassword: (data) => api.post('/concierge/passwords', data),
  scheduleEvent: (data) => api.post('/concierge/schedule', data)
}

export const guardianAPI = {
  getProfile: () => api.get('/guardian'),
  toggle: () => api.put('/guardian/toggle'),
  addJournalEntry: (data) => api.post('/guardian/journal', data),
  checkIn: (data) => api.post('/guardian/checkin', data),
  setCheckInFrequency: (frequency) => api.put('/guardian/checkin-frequency', { frequency }),
  addContact: (data) => api.post('/guardian/contacts', data),
  addTrigger: (data) => api.post('/guardian/triggers', data),
  logBiometric: (data) => api.post('/guardian/biometrics', data),
  getAlerts: () => api.get('/guardian/alerts'),
  resolveAlert: (alertId) => api.put(`/guardian/alerts/${alertId}/resolve`)
}

export const kidsAPI = {
  getCapsules: () => api.get('/kids'),
  createCapsule: (data) => api.post('/kids', data),
  getCapsule: (id) => api.get(`/kids/${id}`),
  updateCapsule: (id, data) => api.put(`/kids/${id}`, data),
  sealCapsule: (id) => api.post(`/kids/${id}/seal`),
  deleteCapsule: (id) => api.delete(`/kids/${id}`)
}

export const familyAPI = {
  getPlans: () => api.get('/family'),
  createPlan: (data) => api.post('/family', data),
  getPlan: (id) => api.get(`/family/${id}`),
  addMember: (id, data) => api.post(`/family/${id}/members`, data),
  addToVault: (id, data) => api.post(`/family/${id}/vault`, data),
  addTimeline: (id, data) => api.post(`/family/${id}/timeline`, data)
}

export const biographerAPI = {
  getProjects: () => api.get('/biographer'),
  createProject: (data) => api.post('/biographer', data),
  getProject: (id) => api.get(`/biographer/${id}`),
  addMedia: (id, data) => api.post(`/biographer/${id}/media`, data),
  addTimeline: (id, data) => api.post(`/biographer/${id}/timeline`, data),
  generateAutobiography: (id, data = {}) => api.post(`/biographer/${id}/generate`, data)
}

export const bankingAPI = {
  getPartnerships: () => api.get('/banking'),
  createPartnership: (data) => api.post('/banking', data),
  getPartnership: (id) => api.get(`/banking/${id}`),
  submitVerification: (id, data) => api.post(`/banking/${id}/verify`, data),
  initiateTransfer: (id, data) => api.post(`/banking/${id}/transfers`, data),
  getAuditLog: (id) => api.get(`/banking/${id}/audit`)
}

export const cryptoAPI = {
  get: () => api.get('/crypto'),
  addWallet: (data) => api.post('/crypto/wallets', data),
  addRecovery: (data) => api.post('/crypto/recovery', data),
  addTrigger: (data) => api.post('/crypto/triggers', data),
  activate: () => api.put('/crypto/activate')
}

export const creatorAPI = {
  getProfile: () => api.get('/creator/profile'),
  createProfile: (data) => api.post('/creator/profile', data),
  addTier: (data) => api.post('/creator/profile/tiers', data),
  subscribe: (creatorId, data) => api.post(`/creator/${creatorId}/subscribe`, data),
  addLicense: (data) => api.post('/creator/profile/licenses', data),
  getRevenue: () => api.get('/creator/profile/revenue'),
  getStorefront: (creatorId) => api.get(`/creator/${creatorId}/storefront`)
}

export const tenantAPI = {
  getOrganizations: () => api.get('/tenant'),
  createOrganization: (data) => api.post('/tenant', data),
  getOrganization: (id) => api.get(`/tenant/${id}`),
  addMember: (id, data) => api.post(`/tenant/${id}/members`, data),
  addProgram: (id, data) => api.post(`/tenant/${id}/programs`, data),
  submitReport: (id, data) => api.post(`/tenant/${id}/reports`, data),
  recordConsent: (id) => api.post(`/tenant/${id}/consent`)
}

export const executorAPI = {
  getCases: () => api.get('/executor'),
  createCase: (data) => api.post('/executor', data),
  getCase: (id) => api.get(`/executor/${id}`),
  updateStep: (caseId, stepId, data) => api.put(`/executor/${caseId}/steps/${stepId}`, data),
  addBeneficiary: (caseId, data) => api.post(`/executor/${caseId}/beneficiaries`, data),
  generateForm: (caseId, data) => api.post(`/executor/${caseId}/forms`, data),
  addEvidence: (caseId, data) => api.post(`/executor/${caseId}/evidence`, data),
  sendCommunication: (caseId, data) => api.post(`/executor/${caseId}/communications`, data)
}

export default api
