import mongoose from 'mongoose'

const familyPlanSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: { type: String, required: true },
    type: { type: String, enum: ['couple', 'family', 'group'], default: 'family' },
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        email: String,
        name: String,
        role: {
          type: String,
          enum: ['owner', 'admin', 'member', 'readonly'],
          default: 'member'
        },
        permissions: {
          viewVault: { type: Boolean, default: true },
          editVault: { type: Boolean, default: false },
          viewTimeline: { type: Boolean, default: true },
          manageMembers: { type: Boolean, default: false }
        },
        joinedAt: { type: Date, default: Date.now }
      }
    ],
    sharedVault: [
      {
        title: { type: String, required: true },
        type: { type: String, enum: ['document', 'photo', 'video', 'note'], default: 'document' },
        fileUrl: String,
        content: String,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    sharedTimeline: [
      {
        title: { type: String, required: true },
        description: String,
        date: Date,
        mediaUrls: [String],
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    subscriptionTier: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic'
    }
  },
  { timestamps: true }
)

export default mongoose.model('FamilyPlan', familyPlanSchema)
