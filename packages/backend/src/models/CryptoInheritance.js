import mongoose from 'mongoose'

const cryptoInheritanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    wallets: [
      {
        label: { type: String, required: true },
        network: { type: String, required: true },
        publicAddress: String,
        multiSigThreshold: { type: Number, default: 2 },
        multiSigParticipants: [
          {
            name: String,
            email: String,
            publicKey: String
          }
        ],
        encryptedKeyShare: String,
        estimatedValue: Number,
        currency: String
      }
    ],
    recoveryMechanisms: [
      {
        type: {
          type: String,
          enum: ['social_recovery', 'hardware_key', 'time_lock', 'dead_mans_switch'],
          default: 'social_recovery'
        },
        description: String,
        guardians: [
          {
            name: String,
            email: String,
            shareIndex: Number
          }
        ],
        timeLockDays: Number,
        activated: { type: Boolean, default: false }
      }
    ],
    inheritanceTriggers: [
      {
        type: {
          type: String,
          enum: ['death_certificate', 'inactivity', 'manual', 'legal_order'],
          default: 'inactivity'
        },
        inactivityDays: Number,
        beneficiaries: [
          {
            name: String,
            email: String,
            walletAddress: String,
            allocationPercent: Number
          }
        ],
        triggered: { type: Boolean, default: false },
        triggeredAt: Date
      }
    ],
    status: {
      type: String,
      enum: ['setup', 'active', 'triggered', 'settled'],
      default: 'setup'
    }
  },
  { timestamps: true }
)

export default mongoose.model('CryptoInheritance', cryptoInheritanceSchema)
