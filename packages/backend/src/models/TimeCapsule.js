import mongoose from 'mongoose'

const timeCapsuleSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    recipientName: String,
    recipientEmail: String,
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    mediaUrls: [String],
    // Release trigger
    releaseType: {
      type: String,
      enum: ['age', 'date', 'event', 'on_death'],
      default: 'date'
    },
    releaseDate: Date,
    releaseAge: Number,
    releaseEvent: String,
    // Content safety
    contentRating: {
      type: String,
      enum: ['all_ages', 'teen', 'adult'],
      default: 'all_ages'
    },
    // Parent approval
    parentApproved: {
      type: Boolean,
      default: true
    },
    isDelivered: {
      type: Boolean,
      default: false
    },
    deliveredAt: Date
  },
  { timestamps: true }
)

export default mongoose.model('TimeCapsule', timeCapsuleSchema)
