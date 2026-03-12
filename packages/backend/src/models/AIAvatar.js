import mongoose from 'mongoose'

const goalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    targetDate: Date,
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'active'
    }
  },
  { timestamps: true }
)

const coachingSessionSchema = new mongoose.Schema(
  {
    userMessage: { type: String, required: true },
    avatarResponse: { type: String, required: true },
    sessionType: {
      type: String,
      enum: ['general', 'goal_review', 'daily_checkin', 'motivation', 'reflection'],
      default: 'general'
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral'
    }
  },
  { timestamps: true }
)

const checkInSchema = new mongoose.Schema(
  {
    mood: {
      type: String,
      enum: ['great', 'good', 'okay', 'low', 'struggling'],
      required: true
    },
    note: String,
    energyLevel: { type: Number, min: 1, max: 10 },
    gratitude: String
  },
  { timestamps: true }
)

const reminderSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    dueDate: Date,
    completed: { type: Boolean, default: false },
    recurringFrequency: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly'],
      default: 'once'
    }
  },
  { timestamps: true }
)

const aiAvatarSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    // Avatar identity
    name: {
      type: String,
      default: 'My Avatar',
      maxlength: 50
    },

    // Subscription tier — controls which customization options are accessible
    // free:    basic name, accent color, default greeting
    // premium: + personality style, voice style, photo-based avatar, animated photo
    // elite:   + coaching style, full AI personality model, legacy mode unlock
    tier: {
      type: String,
      enum: ['free', 'premium', 'elite'],
      default: 'free'
    },

    // Photo-based avatar (uploaded by user; premium enables AI stylization)
    photo: String, // URL / storage path
    photoAnimated: String, // AI-stylized/animated version (premium+)

    // Customization options (tier-gated, enforced in routes)
    customization: {
      accentColor: { type: String, default: '#6366f1' },       // free
      greeting: { type: String, default: 'Hello! How can I help you today?' }, // free
      personality: {                                            // premium+
        type: String,
        enum: ['motivational', 'calm', 'analytical', 'playful', 'empathetic'],
        default: 'motivational'
      },
      voiceStyle: {                                             // premium+
        type: String,
        enum: ['warm', 'professional', 'energetic', 'gentle'],
        default: 'warm'
      },
      coachingStyle: {                                          // elite
        type: String,
        enum: ['tough_love', 'gentle', 'socratic', 'structured', 'inspirational'],
        default: 'gentle'
      },
      backgroundTheme: {                                        // premium+
        type: String,
        enum: ['aurora', 'cosmos', 'forest', 'ocean', 'minimal'],
        default: 'minimal'
      }
    },

    // Life assistant — goals, coaching, check-ins, reminders
    goals: [goalSchema],
    coachingSessions: [coachingSessionSchema],
    checkIns: [checkInSchema],
    reminders: [reminderSchema],

    // Legacy mode — what the avatar becomes after the user passes
    legacy: {
      isActive: { type: Boolean, default: false },
      activatedAt: Date,
      legacyMessage: String,    // Personal message the avatar always opens with after death
      accessLevel: {
        type: String,
        enum: ['public', 'friends', 'family', 'private'],
        default: 'friends'
      },
      totalInteractions: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
)

export default mongoose.model('AIAvatar', aiAvatarSchema)
