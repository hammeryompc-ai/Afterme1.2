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
    title: { type: String, required: true },
    message: String,
    mediaUrls: [String],
    releaseRules: {
      type: { type: String, enum: ['date', 'age', 'event', 'manual'], default: 'date' },
      releaseDate: Date,
      releaseAge: Number,
      recipientBirthDate: Date,
      eventDescription: String
    },
    parentVaultId: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeCapsule' },
    contentPolicy: {
      ageRating: { type: String, enum: ['all', '13+', '18+'], default: 'all' },
      reviewed: { type: Boolean, default: false }
    },
    status: {
      type: String,
      enum: ['draft', 'sealed', 'released'],
      default: 'draft'
    },
    sealedAt: Date,
    releasedAt: Date
  },
  { timestamps: true }
)

export default mongoose.model('TimeCapsule', timeCapsuleSchema)
