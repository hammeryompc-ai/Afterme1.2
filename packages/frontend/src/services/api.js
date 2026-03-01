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

export const vaultAPI = {
  getDocuments: () => api.get('/vault/documents'),
  createDocument: (data) => api.post('/vault/documents', data),
  updateDocument: (id, data) => api.put(`/vault/documents/${id}`, data),
  deleteDocument: (id) => api.delete(`/vault/documents/${id}`),
  getPasswords: () => api.get('/vault/passwords'),
  createPassword: (data) => api.post('/vault/passwords', data),
  getTasks: () => api.get('/vault/tasks'),
  createTask: (data) => api.post('/vault/tasks', data),
  updateTask: (id, data) => api.put(`/vault/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/vault/tasks/${id}`),
  getContacts: () => api.get('/vault/contacts'),
  createContact: (data) => api.post('/vault/contacts', data),
  updateContact: (id, data) => api.put(`/vault/contacts/${id}`, data),
  deleteContact: (id) => api.delete(`/vault/contacts/${id}`)
}

export const guardianAPI = {
  getJournal: () => api.get('/guardian/journal'),
  createJournalEntry: (data) => api.post('/guardian/journal', data),
  updateJournalEntry: (id, data) => api.put(`/guardian/journal/${id}`, data),
  deleteJournalEntry: (id) => api.delete(`/guardian/journal/${id}`),
  getSettings: () => api.get('/guardian/settings'),
  updateSettings: (data) => api.put('/guardian/settings', data),
  getContacts: () => api.get('/guardian/contacts')
}

export const timecapsuleAPI = {
  getCapsules: () => api.get('/timecapsule'),
  getCapsule: (id) => api.get(`/timecapsule/${id}`),
  createCapsule: (data) => api.post('/timecapsule', data),
  updateCapsule: (id, data) => api.put(`/timecapsule/${id}`, data),
  deleteCapsule: (id) => api.delete(`/timecapsule/${id}`),
  deliverCapsule: (id) => api.post(`/timecapsule/${id}/deliver`)
}

export const familyAPI = {
  getPlan: () => api.get('/family/plan'),
  createPlan: (data) => api.post('/family/plan', data),
  inviteMember: (data) => api.post('/family/plan/invite', data),
  updateMember: (memberId, data) => api.put(`/family/plan/members/${memberId}`, data),
  removeMember: (memberId) => api.delete(`/family/plan/members/${memberId}`),
  updatePlan: (data) => api.put('/family/plan', data)
}

export const biographyAPI = {
  getBiography: () => api.get('/biography'),
  addTimelineEntry: (data) => api.post('/biography/timeline', data),
  updateTimelineEntry: (id, data) => api.put(`/biography/timeline/${id}`, data),
  deleteTimelineEntry: (id) => api.delete(`/biography/timeline/${id}`),
  addMedia: (data) => api.post('/biography/media', data),
  generateAutobiography: () => api.post('/biography/generate'),
  updatePublishStatus: (publishStatus) => api.put('/biography/publish', { publishStatus })
}

export const estateAPI = {
  getCases: () => api.get('/estate'),
  getCase: (id) => api.get(`/estate/${id}`),
  createCase: (data) => api.post('/estate', data),
  updateStep: (id, stepNumber, data) => api.put(`/estate/${id}/steps/${stepNumber}`, data),
  addBeneficiary: (id, data) => api.post(`/estate/${id}/beneficiaries`, data),
  updateBeneficiary: (id, benId, data) => api.put(`/estate/${id}/beneficiaries/${benId}`, data),
  addEvidence: (id, data) => api.post(`/estate/${id}/evidence`, data),
  logCommunication: (id, data) => api.post(`/estate/${id}/communications`, data),
  closeCase: (id) => api.put(`/estate/${id}/close`)
}

export const cryptoAPI = {
  getEntries: () => api.get('/crypto'),
  getEntry: (id) => api.get(`/crypto/${id}`),
  createEntry: (data) => api.post('/crypto', data),
  updateEntry: (id, data) => api.put(`/crypto/${id}`, data),
  deleteEntry: (id) => api.delete(`/crypto/${id}`),
  addShard: (id, data) => api.post(`/crypto/${id}/shards`, data),
  confirmShard: (id, shardId) => api.put(`/crypto/${id}/shards/${shardId}/confirm`)
}

export const creatorAPI = {
  getProfile: () => api.get('/creator/profile'),
  getPublicProfile: (userId) => api.get(`/creator/profile/${userId}`),
  updateProfile: (data) => api.put('/creator/profile', data),
  addTier: (data) => api.post('/creator/profile/tiers', data),
  updateTier: (tierId, data) => api.put(`/creator/profile/tiers/${tierId}`, data),
  addLicense: (data) => api.post('/creator/profile/licenses', data),
  getRevenue: () => api.get('/creator/revenue')
}

export const adminAPI = {
  getOrg: () => api.get('/admin/org'),
  updateOrg: (data) => api.put('/admin/org', data),
  getDashboard: () => api.get('/admin/dashboard'),
  generateGrantReport: (data) => api.post('/admin/grant-report', data),
  recordConsent: (data) => api.post('/admin/consent', data),
  getConsentLog: () => api.get('/admin/consent')
}

export default api
