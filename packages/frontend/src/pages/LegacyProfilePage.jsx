import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Send, Heart, Mic, Volume2 } from 'lucide-react'
import { userAPI, aiAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function LegacyProfilePage() {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)

  useEffect(() => {
    loadUserProfile()
  }, [userId])

  const loadUserProfile = async () => {
    try {
      const { data } = await userAPI.getUser(userId)
      setUser(data)
    } catch (error) {
      toast.error('Could not load legacy profile')
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        sendVoiceMessage(blob)
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      toast.error('Microphone access denied')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const sendVoiceMessage = async (audioBlob) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'voice',
        sender: 'user',
        timestamp: new Date()
      }
    ])

    try {
      const { data } = await aiAPI.interactWithAIClone(userId, '')
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'voice',
          sender: 'ai',
          content: data.voiceUrl,
          timestamp: new Date()
        }
      ])
    } catch (error) {
      toast.error('Failed to get AI response')
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'text',
        sender: 'user',
        content: inputMessage,
        timestamp: new Date()
      }
    ])

    setInputMessage('')

    try {
      const { data } = await aiAPI.interactWithAIClone(userId, inputMessage)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'text',
          sender: 'ai',
          content: data.response,
          timestamp: new Date()
        }
      ])
    } catch (error) {
      toast.error('Failed to get AI response')
    }
  }

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return <div className="h-screen flex items-center justify-center">Profile not found</div>
  }

  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600">Their Legacy Lives On</p>
            {user.isMemorialized && (
              <p className="text-sm text-secondary-500 font-semibold flex items-center gap-1 mt-1">
                <Heart size={16} /> Memorialized Profile
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="max-w-2xl mx-auto w-full">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`max-w-xs sm:max-w-md px-4 py-2 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {msg.type === 'text' ? (
                  <p>{msg.content}</p>
                ) : (
                  <button className="flex items-center gap-2 hover:opacity-80">
                    <Volume2 size={18} />
                    Play Voice Message
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-full transition ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            <Mic size={20} />
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Message their legacy..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim()}
            className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
