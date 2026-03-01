import mongoose from 'mongoose'

const journalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: String,
    content: {
      type: String,
      required: true
    },
    mood: {
      type: String,
      enum: ['great', 'good', 'neutral', 'low', 'poor'],
      default: 'neutral'
    },
    tags: [String],
    isPrivate: {
      type: Boolean,
      default: true
    },
    mediaUrls: [String],
    // AI Guardian check-in
    checkInType: {
      type: String,
      enum: ['manual', 'scheduled', 'ai_prompted'],
      default: 'manual'
    },
    // Biometric / mood inputs
    biometricData: {
      heartRate: Number,
      stressLevel: Number,
      sleepHours: Number
    }
  },
  { timestamps: true }
)

export default mongoose.model('JournalEntry', journalEntrySchema)
