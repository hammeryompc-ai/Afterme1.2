import mongoose from 'mongoose'

const creatorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    displayName: { type: String, required: true },
    bio: String,
    category: {
      type: String,
      enum: ['musician', 'actor', 'athlete', 'influencer', 'author', 'other'],
      default: 'influencer'
    },
    storefront: {
      enabled: { type: Boolean, default: false },
      bannerUrl: String,
      featuredContent: [
        {
          title: String,
          description: String,
          mediaUrl: String,
          price: Number,
          currency: { type: String, default: 'USD' }
        }
      ]
    },
    subscriptionTiers: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        billingInterval: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
        benefits: [String],
        subscriberCount: { type: Number, default: 0 }
      }
    ],
    subscribers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        tierId: mongoose.Schema.Types.ObjectId,
        subscribedAt: { type: Date, default: Date.now },
        expiresAt: Date,
        active: { type: Boolean, default: true }
      }
    ],
    revShare: {
      platformPercent: { type: Number, default: 20 },
      creatorPercent: { type: Number, default: 80 },
      totalEarnings: { type: Number, default: 0 },
      pendingPayout: { type: Number, default: 0 },
      payoutHistory: [
        {
          amount: Number,
          currency: { type: String, default: 'USD' },
          paidAt: Date,
          reference: String
        }
      ]
    },
    licensingAgreements: [
      {
        licenseType: { type: String, enum: ['exclusive', 'non_exclusive', 'limited'] },
        licensee: String,
        territory: String,
        startDate: Date,
        endDate: Date,
        royaltyPercent: Number,
        status: { type: String, enum: ['draft', 'active', 'expired'], default: 'draft' }
      }
    ]
  },
  { timestamps: true }
)

export default mongoose.model('CreatorProfile', creatorProfileSchema)
