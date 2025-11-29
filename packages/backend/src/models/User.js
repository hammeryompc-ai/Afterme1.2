import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    profilePhoto: String,
    bio: String,
    
    // AI Features
    isMemorialized: {
      type: Boolean,
      default: false
    },
    memorializedAt: Date,
    personalityProfile: {
      traits: [String],
      trainingProgress: {
        type: Number,
        default: 0
      },
      trained: {
        type: Boolean,
        default: false
      }
    },
    voiceClone: {
      trained: {
        type: Boolean,
        default: false
      },
      samples: [String],
      modelPath: String
    },
    
    // Privacy
    legacyVisibility: {
      type: String,
      enum: ['public', 'friends', 'family', 'custom'],
      default: 'friends'
    },
    legacyAccess: [mongoose.Schema.Types.ObjectId],
    
    // Status
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: Date
  },
  { timestamps: true }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Exclude password from toJSON
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  return user
}

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

export default mongoose.model('User', userSchema)
