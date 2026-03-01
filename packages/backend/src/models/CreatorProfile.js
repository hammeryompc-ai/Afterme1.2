import mongoose from 'mongoose'

const creatorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    displayName: String,
    bio: String,
    category: {
      type: String,
      enum: ['musician', 'athlete', 'influencer', 'actor', 'author', 'public_figure', 'other'],
      default: 'influencer'
    },
    // Storefront
    subscriptionTiers: [
      {
        name: String,
        price: Number,
        description: String,
        features: [String],
        isActive: { type: Boolean, default: true }
      }
    ],
    // Licensing
    licensingAgreements: [
      {
        licenseeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        licenseeName: String,
        terms: String,
        royaltyPercent: Number,
        startDate: Date,
        endDate: Date,
        isActive: { type: Boolean, default: true },
        signedAt: Date
      }
    ],
    // Revenue tracking
    revenueSharePercent: { type: Number, default: 70 },
    totalRevenue: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

export default mongoose.model('CreatorProfile', creatorProfileSchema)
