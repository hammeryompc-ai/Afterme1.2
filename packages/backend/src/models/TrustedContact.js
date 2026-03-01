import mongoose from 'mongoose'

const trustedContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    contactUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: true
    },
    email: String,
    phone: String,
    relationship: {
      type: String,
      enum: ['spouse', 'parent', 'child', 'sibling', 'friend', 'attorney', 'executor', 'other'],
      default: 'other'
    },
    role: {
      type: String,
      enum: ['guardian_alert', 'executor', 'family', 'emergency', 'beneficiary'],
      default: 'emergency'
    },
    permissions: {
      canAccessVault: { type: Boolean, default: false },
      canAccessMessages: { type: Boolean, default: false },
      canTriggerAlerts: { type: Boolean, default: true },
      canManageEstate: { type: Boolean, default: false }
    },
    alertPreferences: {
      missedCheckIn: { type: Boolean, default: true },
      lowMoodDetected: { type: Boolean, default: false },
      emergencyTrigger: { type: Boolean, default: true }
    },
    isConfirmed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

export default mongoose.model('TrustedContact', trustedContactSchema)
