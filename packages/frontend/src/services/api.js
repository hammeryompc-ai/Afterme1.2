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

export default api
