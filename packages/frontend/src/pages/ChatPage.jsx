import React, { useEffect, useState, useRef } from 'react'
import { Send, Phone, Search, Home, User, LogOut, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { chatAPI, userAPI } from '../services/api'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import { initSocket, getSocket, socketEvents } from '../services/socket'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

export default function ChatPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const {
    conversations,
    setConversations,
    currentConversation,
    setCurrentConversation,
    messages,
    setMessages,
    addMessage,
    typingUsers,
    setTypingUsers,
    onlineUsers,
    setOnlineUsers
  } = useChatStore()

  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadConversations()
    initSocket()
    const socket = getSocket()
    
    socket.on(socketEvents.MESSAGE_RECEIVED, (message) => {
      addMessage(message)
    })

    socket.on(socketEvents.TYPING_START, (data) => {
      setTypingUsers((prev) => [...new Set([...prev, data.userId])])
    })

    socket.on(socketEvents.TYPING_STOP, (data) => {
      setTypingUsers((prev) => prev.filter((id) => id !== data.userId))
    })

    socket.on(socketEvents.USER_ONLINE, (userId) => {
      setOnlineUsers((prev) => new Set([...prev, userId]))
    })

    socket.on(socketEvents.USER_OFFLINE, (userId) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    })

    return () => {
      socket.off(socketEvents.MESSAGE_RECEIVED)
      socket.off(socketEvents.TYPING_START)
      socket.off(socketEvents.TYPING_STOP)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = async () => {
    try {
      const { data } = await chatAPI.getConversations()
      setConversations(data)
    } catch (error) {
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId) => {
    try {
      const { data } = await chatAPI.getMessages(conversationId)
      setMessages(data)
      chatAPI.markAsRead(conversationId)
    } catch (error) {
      toast.error('Failed to load messages')
    }
  }

  const handleConversationSelect = (conversation) => {
    setCurrentConversation(conversation)
    loadMessages(conversation.id)
  }

  const handleSearchUsers = async (query) => {
    setSearchQuery(query)
    if (query.length > 2) {
      try {
        const { data } = await userAPI.searchUsers(query)
        setSearchResults(data)
      } catch (error) {
        toast.error('Search failed')
      }
    }
  }

  const handleCreateConversation = async (userId) => {
    try {
      const { data } = await chatAPI.createConversation([userId])
      setConversations((prev) => [data, ...prev])
      handleConversationSelect(data)
      setShowNewConversation(false)
      setSearchQuery('')
      setSearchResults([])
    } catch (error) {
      toast.error('Failed to create conversation')
    }
  }

  const sendMessage = async () => {
    if (!messageInput.trim() || !currentConversation) return

    const tempId = Date.now()
    const tempMessage = {
      id: tempId,
      conversationId: currentConversation.id,
      senderId: user.id,
      sender: user,
      content: messageInput,
      type: 'text',
      read: false,
      createdAt: new Date()
    }

    addMessage(tempMessage)
    setMessageInput('')

    try {
      const { data } = await chatAPI.sendMessage(
        currentConversation.id,
        messageInput,
        'text'
      )
      
      const socket = getSocket()
      socket.emit('message:sent', {
        ...data,
        conversationId: currentConversation.id
      })
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const handleTyping = () => {
    const socket = getSocket()
    socket.emit(socketEvents.TYPING_START, {
      conversationId: currentConversation?.id
    })

    setTimeout(() => {
      socket.emit(socketEvents.TYPING_STOP, {
        conversationId: currentConversation?.id
      })
    }, 3000)
  }

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar */}
      <div className="w-full sm:w-80 border-r border-gray-200 flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
            <button
              onClick={() => setShowNewConversation(!showNewConversation)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="New conversation"
            >
              <Plus size={24} className="text-primary-500" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* New Conversation Section */}
        {showNewConversation && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearchUsers(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none mb-2"
            />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleCreateConversation(result.id)}
                  className="w-full text-left p-3 hover:bg-gray-200 rounded-lg transition flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                    {result.firstName?.[0]}{result.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {result.firstName} {result.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{result.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet. Start a new one!
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleConversationSelect(conv)}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition ${
                  currentConversation?.id === conv.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                      {conv.participants[0].firstName?.[0]}
                      {conv.participants[0].lastName?.[0]}
                    </div>
                    {onlineUsers.has(conv.participants[0].id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {conv.participants[0].firstName} {conv.participants[0].lastName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    {conv.lastMessage?.createdAt
                      ? formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                          addSuffix: true
                        })
                      : ''}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition text-gray-900"
          >
            <User size={20} />
            <span>Profile</span>
          </button>
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-100 rounded-lg transition text-red-600"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      {currentConversation ? (
        <div className="hidden sm:flex flex-1 flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                {currentConversation.participants[0].firstName?.[0]}
                {currentConversation.participants[0].lastName?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {currentConversation.participants[0].firstName}{' '}
                  {currentConversation.participants[0].lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {onlineUsers.has(currentConversation.participants[0].id)
                    ? 'Active now'
                    : 'Offline'}
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Phone size={20} className="text-primary-500" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    msg.senderId === user.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.senderId === user.id ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value)
                  handleTyping()
                }}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Aa"
                className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={sendMessage}
                disabled={!messageInput.trim()}
                className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden sm:flex flex-1 items-center justify-center text-gray-500">
          <div className="text-center">
            <Home size={48} className="mx-auto mb-4 opacity-50" />
            <p>Select a conversation to start chatting</p>
          </div>
        </div>
      )}
    </div>
  )
}
