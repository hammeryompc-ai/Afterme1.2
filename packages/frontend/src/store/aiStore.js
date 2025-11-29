import { create } from 'zustand'

export const useAIStore = create((set) => ({
  personalityProfile: null,
  voiceClone: null,
  trainingProgress: 0,
  isMemorialized: false,
  
  setPersonalityProfile: (profile) => set({ personalityProfile: profile }),
  setVoiceClone: (clone) => set({ voiceClone: clone }),
  setTrainingProgress: (progress) => set({ trainingProgress: progress }),
  setIsMemorialized: (status) => set({ isMemorialized: status })
}))
