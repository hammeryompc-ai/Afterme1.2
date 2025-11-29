import { create } from 'zustand'

export const useChatStore = create((set) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  typingUsers: [],
  onlineUsers: new Set(),
  
  setConversations: (conversations) => set({ conversations }),
  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  setTypingUsers: (users) => set({ typingUsers: users }),
  setOnlineUsers: (users) => set({ onlineUsers: new Set(users) })
}))
