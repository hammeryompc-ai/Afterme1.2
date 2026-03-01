import mongoose from 'mongoose'

const familyPlanSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    planType: {
      type: String,
      enum: ['couple', 'family', 'extended'],
      default: 'family'
    },
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: {
          type: String,
          enum: ['owner', 'admin', 'member', 'child', 'view_only'],
          default: 'member'
        },
        permissions: {
          canEditVault: { type: Boolean, default: false },
          canViewTimeline: { type: Boolean, default: true },
          canAddMemories: { type: Boolean, default: true },
          canManageMembers: { type: Boolean, default: false }
        },
        joinedAt: { type: Date, default: Date.now }
      }
    ],
    sharedVaultEnabled: {
      type: Boolean,
      default: true
    },
    sharedTimelineEnabled: {
      type: Boolean,
      default: true
    },
    // Subscription
    subscriptionTier: {
      type: String,
      enum: ['basic', 'premium', 'unlimited'],
      default: 'basic'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

export default mongoose.model('FamilyPlan', familyPlanSchema)
