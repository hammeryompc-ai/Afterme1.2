import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader, Mic, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { userAPI, aiAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useAIStore } from '../store/aiStore'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    personalityProfile,
    setPersonalityProfile,
    trainingProgress,
    setTrainingProgress,
    isMemorialized,
    setIsMemorialized
  } = useAIStore()

  const [activeTab, setActiveTab] = useState('personality')
  const [loading, setLoading] = useState(false)
  const [trainingData, setTrainingData] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [voiceSamples, setVoiceSamples] = useState([])

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data } = await aiAPI.getPersonalityProfile()
      setPersonalityProfile(data)
    } catch (error) {
      // Profile doesn't exist yet
    }
  }

  const startPersonalityTraining = async () => {
    setLoading(true)
    try {
      await aiAPI.startPersonalityTraining()
      toast.success('Personality training started!')
      setActiveTab('personality-input')
    } catch (error) {
      toast.error('Failed to start training')
    } finally {
      setLoading(false)
    }
  }

  const submitTrainingData = async () => {
    if (!trainingData.trim()) {
      toast.error('Please enter some data')
      return
    }

    setLoading(true)
    try {
      const { data } = await aiAPI.submitTrainingData({
        dataPoints: [trainingData]
      })
      setTrainingProgress(data.progress)
      setTrainingData('')
      toast.success('Data submitted! Training progress: ' + data.progress + '%')

      if (data.progress >= 100) {
        setPersonalityProfile(data.profile)
        setActiveTab('voice')
      }
    } catch (error) {
      toast.error('Failed to submit data')
    } finally {
      setLoading(false)
    }
  }

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks = []

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        uploadVoiceSample(blob)
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Stop after 10 seconds
      setTimeout(() => {
        mediaRecorder.stop()
        setIsRecording(false)
      }, 10000)
    } catch (error) {
      toast.error('Microphone access denied')
    }
  }

  const uploadVoiceSample = async (audioBlob) => {
    setLoading(true)
    try {
      const { data } = await aiAPI.uploadVoiceSample(audioBlob)
      setVoiceSamples((prev) => [...prev, data])
      toast.success('Voice sample uploaded!')

      if (voiceSamples.length + 1 >= 3) {
        toast.success('Voice cloning trained! You can now memorialize your profile.')
      }
    } catch (error) {
      toast.error('Failed to upload voice sample')
    } finally {
      setLoading(false)
    }
  }

  const memorializeProfile = async () => {
    if (voiceSamples.length < 3) {
      toast.error('Please upload at least 3 voice samples first')
      return
    }

    setLoading(true)
    try {
      await aiAPI.memorializeProfile()
      setIsMemorialized(true)
      toast.success('Your legacy profile is now active!')
    } catch (error) {
      toast.error('Failed to memorialize profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Legacy Profile</h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-600 mb-4">{user?.email}</p>
              {isMemorialized && (
                <p className="text-sm text-secondary-500 font-semibold flex items-center gap-2">
                  <Heart size={18} /> Your legacy is memorialized and active
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('personality')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'personality'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Personality Training
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'voice'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Voice Cloning
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Legacy Settings
          </button>
        </div>

        {/* Personality Tab */}
        {activeTab === 'personality' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Create Your Personality Clone
            </h3>
            <p className="text-gray-600 mb-6">
              Train our AI to learn your personality through your memories, stories, and values.
              This will allow your digital legacy to interact with your loved ones.
            </p>

            {!personalityProfile ? (
              <button
                onClick={startPersonalityTraining}
                disabled={loading}
                className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition flex items-center gap-2"
              >
                {loading && <Loader size={20} className="animate-spin" />}
                Start Personality Training
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-green-800 font-semibold">
                  ✓ Personality profile created!
                </p>
                <p className="text-green-700 text-sm mt-2">
                  Your personality has been trained and is ready to interact.
                </p>
              </div>
            )}

            {personalityProfile && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Personality Traits</h4>
                <ul className="space-y-2 text-gray-700">
                  {personalityProfile.traits?.map((trait, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      {trait}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Personality Input Tab */}
        {activeTab === 'personality-input' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Share Your Stories
            </h3>
            <p className="text-gray-600 mb-6">
              Share memories, values, and personality traits. The more you share, the better the AI will understand you.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's a memorable moment that defines who you are?
              </label>
              <textarea
                value={trainingData}
                onChange={(e) => setTrainingData(e.target.value)}
                placeholder="Share a story, memory, or something that's important to you..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Training Progress: {trainingProgress}%
              </p>
            </div>

            <button
              onClick={submitTrainingData}
              disabled={loading || !trainingData.trim()}
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 transition flex items-center gap-2"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              Submit
            </button>
          </div>
        )}

        {/* Voice Cloning Tab */}
        {activeTab === 'voice' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Voice Cloning
            </h3>
            <p className="text-gray-600 mb-6">
              Record your voice to create an AI clone. We need at least 3 samples of 10 seconds each.
            </p>

            <div className="grid gap-4 mb-6">
              {voiceSamples.map((sample, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <Mic size={20} className="text-green-600" />
                  <p className="text-green-800 font-semibold">Voice Sample {idx + 1}</p>
                </div>
              ))}
            </div>

            {voiceSamples.length < 3 && (
              <button
                onClick={startVoiceRecording}
                disabled={loading || isRecording}
                className={`w-full font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                } disabled:opacity-50`}
              >
                {isRecording ? (
                  <>
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    Recording... ({3 - voiceSamples.length} more needed)
                  </>
                ) : (
                  <>
                    <Mic size={20} />
                    Record Voice Sample ({voiceSamples.length}/3)
                  </>
                )}
              </button>
            )}

            {voiceSamples.length >= 3 && (
              <button
                onClick={memorializeProfile}
                disabled={loading || isMemorialized}
                className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {loading && <Loader size={20} className="animate-spin" />}
                {isMemorialized ? 'Profile Memorialized' : 'Activate Legacy Profile'}
              </button>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-8 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Legacy Settings
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900 mb-2">
                    Who can interact with your legacy?
                  </p>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                    <option>Everyone (Public)</option>
                    <option>Friends only</option>
                    <option>Family only</option>
                    <option>Custom list</option>
                  </select>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900 mb-2">
                    Legacy Visibility
                  </p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-gray-700">Make my legacy searchable</span>
                  </label>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900 mb-2">
                    AI Response Settings
                  </p>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                    <option>Friendly & Warm</option>
                    <option>Professional</option>
                    <option>Humorous</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
