import mongoose from 'mongoose'

const cryptoInheritanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    walletLabel: {
      type: String,
      required: true
    },
    walletType: {
      type: String,
      enum: ['bitcoin', 'ethereum', 'other_evm', 'solana', 'other'],
      default: 'ethereum'
    },
    walletAddress: String,
    // Multi-sig workflow — never store raw private keys
    multiSigConfig: {
      requiredSigners: { type: Number, default: 2 },
      totalSigners: { type: Number, default: 3 },
      signerAddresses: [String]
    },
    // Recovery shards — stored as encrypted references only
    recoveryShards: [
      {
        shardIndex: Number,
        holderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        holderEmail: String,
        encryptedShardRef: String,
        isConfirmed: { type: Boolean, default: false }
      }
    ],
    // Inheritance trigger
    triggerCondition: {
      type: String,
      enum: ['on_death', 'inactivity', 'manual', 'legal_order'],
      default: 'on_death'
    },
    inactivityDays: { type: Number, default: 365 },
    beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    beneficiaryEmail: String,
    beneficiaryShare: { type: Number, default: 100 },
    isTriggered: { type: Boolean, default: false },
    triggeredAt: Date,
    notes: String
  },
  { timestamps: true }
)

export default mongoose.model('CryptoInheritance', cryptoInheritanceSchema)
