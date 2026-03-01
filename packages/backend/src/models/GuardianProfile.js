import mongoose from 'mongoose'

const checkInSchema = new mongoose.Schema({
  scheduledAt: Date,
  completedAt: Date,
  response: String,
  mood: { type: String, enum: ['great', 'good', 'okay', 'low', 'crisis'], default: 'okay' },
  skipped: { type: Boolean, default: false }
})

const guardianProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    isActive: { type: Boolean, default: false },
    journalEntries: [
      {
        content: { type: String, required: true },
        mood: { type: String, enum: ['great', 'good', 'okay', 'low', 'crisis'], default: 'okay' },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    checkIns: [checkInSchema],
    checkInFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      default: 'weekly'
    },
    trustedContacts: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        email: String,
        name: String,
        phone: String,
        alertOnMissed: { type: Boolean, default: true }
      }
    ],
    triggerConditions: [
      {
        type: {
          type: String,
          enum: ['missed_checkins', 'mood_threshold', 'inactivity', 'manual'],
          default: 'missed_checkins'
        },
        threshold: Number,
        action: { type: String, enum: ['alert_contacts', 'send_message', 'lock_vault'], default: 'alert_contacts' }
      }
    ],
    safetyRules: [
      {
        rule: String,
        enabled: { type: Boolean, default: true }
      }
    ],
    biometricInputs: [
      {
        type: { type: String, enum: ['heart_rate', 'sleep', 'activity', 'mood_score'] },
        value: mongoose.Schema.Types.Mixed,
        recordedAt: { type: Date, default: Date.now }
      }
    ],
    alerts: [
      {
        message: String,
        severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
        sentAt: { type: Date, default: Date.now },
        resolved: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
)

export default mongoose.model('GuardianProfile', guardianProfileSchema)
